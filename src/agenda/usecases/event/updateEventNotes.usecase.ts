import { Injectable, Logger } from '@nestjs/common';

import {
  DomainForbidden,
  DomainNotFound,
} from '../../../global/domain/exceptions/domain.exception';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { EventActionsResultDto } from '../../domain/dtos';
import { EventActionEngineService } from '../../domain/services/eventActionEngine.service';
import { UpdateEventNotesReqDto } from '../../infrastructure/dtos/updateEventNotesReq.dto';
import {
  AgendaEvent,
  IStatusLogEntry,
} from '../../infrastructure/entities/agendaEvent.entity';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';

@Injectable()
export class UpdateEventNotesUseCase {
  private readonly logger = new Logger(UpdateEventNotesUseCase.name);

  constructor(
    private readonly agendaProvider: AgendaRepository,
    private readonly agendaEventProvider: AgendaEventRepository,
    private readonly requestContextService: RequestContextService,
    private readonly eventActionEngineService: EventActionEngineService,
  ) {}

  async execute(
    agendaId: string,
    eventId: string,
    dto: UpdateEventNotesReqDto,
  ): Promise<void> {
    this.logger.log(
      `Updating notes for event ${eventId} in agenda ${agendaId}`,
    );

    const {
      userId,
      userTypeId,
      isNotArtist,
      userType: actorUserTypeEnum,
    } = this.requestContextService;
    const actorRoleForLog: UserType = isNotArtist
      ? UserType.CUSTOMER
      : UserType.ARTIST;

    const actor = {
      userId,
      roleId: userTypeId,
      role: actorRoleForLog,
    };

    const event = await this.agendaEventProvider.findOne({
      where: { id: eventId, agenda: { id: agendaId } },
      relations: ['agenda'],
    });

    if (!event) {
      throw new DomainNotFound(
        `Event with ID ${eventId} not found or does not belong to agenda ${agendaId}`,
      );
    }

    const availableActions: EventActionsResultDto =
      await this.eventActionEngineService.getAvailableActions({
        event,
        userId: userId,
        userType: actorUserTypeEnum,
      });

    if (!availableActions.canEdit) {
      throw new DomainForbidden(
        'User is not authorized to update notes for this event.',
      );
    }

    const oldNotes = event.notes;
    event.notes = dto.notes;

    const logEntry: IStatusLogEntry = {
      status: event.status,
      timestamp: new Date(),
      actor: {
        userId: actor.userId,
        roleId: actor.roleId,
        role: actor.role,
      },
      notes: `Event notes updated. Previous: "${oldNotes || ''}". New: "${
        dto.notes || ''
      }".`,
    };

    event.statusLog = event.statusLog
      ? [...event.statusLog, logEntry]
      : [logEntry];

    await this.agendaEventProvider.save(event);
    this.logger.log(
      `Notes updated for event ${eventId} and status log appended.`,
    );
  }
}
