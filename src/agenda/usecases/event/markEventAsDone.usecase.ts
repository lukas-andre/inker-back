import { Injectable } from '@nestjs/common';

import {
  // DomainNotAcceptable, // Not used after removing event.done check
  DomainNotFound,
  DomainForbidden,
} from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { DefaultResponseDto } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../../global/infrastructure/helpers/defaultResponse.helper';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { MultimediasService } from '../../../multimedias/services/multimedias.service';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import {
  // AGENDA_EVENT_IS_ALREADY_DONE, // Not used
  AGENDA_EVENT_NOT_EXISTS,
} from '../../domain/errors/codes';
import {
  AgendaEventTransition,
  EventStateMachineService,
  StateMachineContext,
} from '../../domain/services/eventStateMachine.service';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity'; // Assuming IActor is problematic, will define structurally
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository'; // For fetching agenda if needed
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';

// Temporary structural type for actor if IActor is not yet exported
interface ActorForMarkDone {
  userId: string;
  roleId: string;
  role: UserType;
}

@Injectable()
export class MarkEventAsDoneUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly agendaEventProvider: AgendaEventRepository,
    private readonly multimediasService: MultimediasService,
    private readonly requestContextService: RequestContextService,
    private readonly eventStateMachineService: EventStateMachineService,
    private readonly agendaRepository: AgendaRepository, // Added for fetching agenda
  ) {
    super(MarkEventAsDoneUseCase.name);
  }

  async execute(
    agendaIdFromRequest: string,
    eventId: string,
    workEvidenceFiles?: FileInterface[],
  ): Promise<DefaultResponseDto> {
    const { userId, userTypeId, isNotArtist } = this.requestContextService;

    if (isNotArtist) {
      throw new DomainForbidden('Only an artist can mark an event as done.');
    }
    const artistId = userId;

    const event = await this.agendaEventProvider.findById(eventId);
    if (!event) {
      throw new DomainNotFound(AGENDA_EVENT_NOT_EXISTS);
    }

    // Ensure agenda is loaded and matches request
    let agenda = event.agenda;
    if (!agenda) {
      this.logger.warn(
        `Agenda not pre-loaded for event ${eventId}, fetching separately.`,
      );
      agenda = await this.agendaRepository.findById(agendaIdFromRequest);
      if (!agenda) {
        throw new DomainNotFound(
          `Agenda with ID ${agendaIdFromRequest} not found.`,
        );
      }
      event.agenda = agenda; // Associate for consistency
    }

    if (agenda.id !== agendaIdFromRequest) {
      throw new DomainForbidden(
        'Event agenda ID does not match requested agenda ID.',
      );
    }

    if (agenda.artistId !== artistId) {
      throw new DomainForbidden(
        'User is not authorized to mark this event as done.',
      );
    }

    const actor: ActorForMarkDone = {
      userId: artistId,
      roleId: userTypeId,
      role: UserType.ARTIST,
    };

    let eventAfterCompletion = event; // To hold the event state after COMPLETE_SESSION

    // Check if the event is already in a state that should prevent marking as done again.
    // State machine guards should ideally handle this, but an initial check can be useful.
    const terminalCompletedStates = [
      AgendaEventStatus.COMPLETED,
      AgendaEventStatus.WAITING_FOR_PHOTOS,
      AgendaEventStatus.REVIEWED,
      AgendaEventStatus.CANCELED,
    ];
    if (!terminalCompletedStates.includes(event.status)) {
      const completeSessionContext: StateMachineContext = {
        eventEntity: event,
        actor,
      };
      // Attempting to pass the event entity itself as the first argument to transition
      const updatedEvent = await this.eventStateMachineService.transition(
        event.status, // Passing event entity
        AgendaEventTransition.COMPLETE_SESSION,
        completeSessionContext,
      );

      if (updatedEvent) {
        const newEvent = await this.agendaEventProvider.findById(event.id);
        if (newEvent) {
          eventAfterCompletion = newEvent;
        }
      }
    } else if (event.status === AgendaEventStatus.CANCELED) {
      throw new DomainForbidden('Cannot mark a CANCELED event as done.');
    }
    // If already COMPLETED, WAITING_FOR_PHOTOS, or REVIEWED, we might still allow adding photos.

    if (workEvidenceFiles && workEvidenceFiles.length > 0) {
      // Ensure the event is in a state that allows adding photos (e.g., post-completion)
      // This check should ideally be a guard in the ADD_PHOTOS transition.
      if (
        eventAfterCompletion.status !== AgendaEventStatus.COMPLETED &&
        eventAfterCompletion.status !== AgendaEventStatus.WAITING_FOR_PHOTOS
      ) {
        this.logger.warn(
          `Event ${eventId} is in status ${eventAfterCompletion.status}, which may not be ready for ADD_PHOTOS. Proceeding, but ensure state machine guards this.`,
        );
        // Optionally, throw an error here if state is not appropriate for adding photos
        // throw new DomainForbidden(`Cannot add photos to event in status ${eventAfterCompletion.status}`);
      }

      const processedWorkEvidence: any =
        await this.multimediasService.handleWorkEvidenceMultimedias(
          workEvidenceFiles,
          eventId,
          agenda.id,
        );

      const addPhotosContext: StateMachineContext = {
        eventEntity: eventAfterCompletion,
        actor,
        payload: {
          // Assuming MultimediasMetadataInterface has a 'location' or similar field for the URL
          // This is a common pattern, adjust if 'url' is nested or named differently.
          workEvidenceUrl: processedWorkEvidence.location,
        },
      };

      // Attempting to pass the event entity itself as the first argument to transition
      await this.eventStateMachineService.transition(
        eventAfterCompletion.status, // Passing event entity
        AgendaEventTransition.ADD_PHOTOS,
        addPhotosContext,
      );
    }

    return DefaultResponse.ok;
  }
}
