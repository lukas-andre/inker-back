import { Injectable, Inject } from '@nestjs/common';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventStatus } from '../enum/agendaEventStatus.enum';
import {
  AgendaEvent,
  IStatusLogEntry,
} from '../../infrastructure/entities/agendaEvent.entity';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { UserType } from '../../../users/domain/enums/userType.enum';

export interface CreateEventParams {
  // Event details
  agendaId: string;
  title: string;
  info: string;
  color: string;
  startDate: Date | string;
  endDate: Date | string;
  notification: boolean;
  customerId: string;
  quotationId?: string;

  // Creator details 
  createdBy: string;
}

export interface CreateEventResult {
  transactionIsOK: boolean;
  eventId: string;
}

@Injectable()
export class CreateAgendaEventService extends BaseComponent {
  constructor(
    private readonly agendaEventRepository: AgendaEventRepository,
    private readonly agendaRepository: AgendaRepository,
  ) {
    super(CreateAgendaEventService.name);
  }


  /**
   * Creates an agenda event specifically from a quotation.
   * This is used by the sync processor when a quotation is accepted.
   */
  async createEventFromQuotation(
    agendaId: string,
    quotationId: string,
    customerId: string,
    title: string,
    info: string,
    color: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ eventId: string; transactionIsOK: boolean }> {
    const queryRunner = this.agendaRepository.source.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let eventId = '';
    let transactionIsOK = false;

    try {
      const initialStatusLogEntry: IStatusLogEntry = {
        status: AgendaEventStatus.CREATED,
        timestamp: new Date(),
        actor: {
          userId: 'system_sync_processor',
          roleId: quotationId,
          role: UserType.SYSTEM,
        },
        notes: 'Event created from quotation by system.',
      };

      const eventToCreate = this.agendaEventRepository.repo.create({
        agenda: { id: agendaId },
        quotationId,
        customerId,
        title,
        info,
        color,
        startDate,
        endDate,
        status: AgendaEventStatus.CREATED,
        statusLog: [initialStatusLogEntry],
      });

      const savedEvent = await queryRunner.manager.save(AgendaEvent, eventToCreate);
      eventId = savedEvent.id;

      await queryRunner.commitTransaction();
      transactionIsOK = true;
      this.logger.log(`Created event with ID ${eventId} from quotation with initial system status log.`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create event from quotation with initial status log', error);
      transactionIsOK = false;
    } finally {
      await queryRunner.release();
    }

    return { eventId, transactionIsOK };
  }

  async createDirectEvent(
    agendaId: string,
    customerId: string | null,
    title: string,
    info: string,
    color: string,
    startDate: Date,
    endDate: Date,
    actor: { userId: string; roleId: string; role: UserType },
    initialStatus: AgendaEventStatus = AgendaEventStatus.CREATED,
    notes?: string,
  ): Promise<{ eventId: string; transactionIsOK: boolean }> {
    const queryRunner = this.agendaRepository.source.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let eventId = '';
    let transactionIsOK = false;

    try {
      const initialLogEntry: IStatusLogEntry = {
        status: initialStatus,
        timestamp: new Date(),
        actor: actor,
        notes: notes || 'Event created directly.',
      };

      const eventToCreate = this.agendaEventRepository.repo.create({
        agenda: { id: agendaId },
        customerId,
        title,
        info,
        color,
        startDate,
        endDate,
        status: initialStatus,
        statusLog: [initialLogEntry],
      });

      const savedEvent = await queryRunner.manager.save(AgendaEvent, eventToCreate);
      eventId = savedEvent.id;

      await queryRunner.commitTransaction();
      transactionIsOK = true;
      this.logger.log(`Created direct event with ID ${eventId} with initial status log by actor: ${actor.userId} (${actor.role})`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create direct event with initial status log', error);
      transactionIsOK = false;
    } finally {
      await queryRunner.release();
    }
    return { eventId, transactionIsOK };
  }
}