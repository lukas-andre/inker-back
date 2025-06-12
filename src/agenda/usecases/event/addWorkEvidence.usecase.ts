import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BaseUseCase, UseCase } from '../../../global/domain/usecases/base.usecase';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { MultimediasService } from '../../../multimedias/services/multimedias.service';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity';
import { EventStateMachineService, StateMachineContext, AgendaEventTransition } from '../../domain/services/eventStateMachine.service';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';

export interface IAddWorkEvidenceCommand {
  actor: {
    id: string;
    type: UserType;
    roleId: string;
  };
  eventId: string;
  files: FileInterface[];
}

@Injectable()
export class AddWorkEvidenceUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly agendaEventRepository: AgendaEventRepository,
    private readonly multimediasService: MultimediasService,
    private readonly eventStateMachine: EventStateMachineService,
  ) {
    super(AddWorkEvidenceUseCase.name);
  }

  async execute(command: IAddWorkEvidenceCommand): Promise<AgendaEvent> {
    const { actor, eventId, files } = command;

    const event = await this.agendaEventRepository.findOne({ where: { id: eventId }, relations: ['agenda']});
    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    if (![AgendaEventStatus.COMPLETED, AgendaEventStatus.WAITING_FOR_PHOTOS, AgendaEventStatus.WAITING_FOR_REVIEW].includes(event.status)) {
        throw new ForbiddenException('Work evidence can only be added when the event is completed or awaiting photos/review.');
    }

    if (actor.type !== UserType.ARTIST || event.agenda.artistId !== actor.roleId) {
        throw new ForbiddenException('Only the assigned artist can add work evidence to this event.');
    }

    const multimediasMetadata = await this.multimediasService.handleWorkEvidenceMultimedias(
      files,
      event.id,
      event.agenda.id,
    );

    event.workEvidence = multimediasMetadata;

    const stateMachineContext: StateMachineContext = {
        eventEntity: event,
        actor: {
            userId: actor.id,
            role: actor.type,
            roleId: actor.roleId,
        },
        payload: {}
    };

    await this.eventStateMachine.transition(
        event.status,
        AgendaEventTransition.ADD_PHOTOS,
        stateMachineContext
    );
    
    // The state machine handles saving the entity after transition.
    return event;
  }
} 