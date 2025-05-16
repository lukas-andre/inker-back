import { Injectable, Inject } from '@nestjs/common';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventStatus } from '../enum/agendaEventStatus.enum';
import {
  AgendaEvent,
  IStatusLogEntry,
  UserType,
} from '../../infrastructure/entities/agendaEvent.entity';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';

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
   * Creates an agenda event with history record in a single transaction.
   * This method can be used both for direct event creation and quotation-based event creation.
   */
  async createEventWithHistory(params: CreateEventParams): Promise<CreateEventResult> {
    let transactionIsOK = false;
    let eventId: string = null;

    const queryRunner = this.agendaRepository.source.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 1. Create the event
      const createEventSql = `
        INSERT INTO agenda_event (
          agenda_id, title, info, color, end_date, start_date, notification, 
          customer_id, done, created_at, updated_at, quotation_id, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, NOW(), NOW(), $9, $10)
        RETURNING id;
      `;

      const eventParams = [
        params.agendaId,
        params.title,
        params.info,
        params.color,
        params.endDate,
        params.startDate,
        params.notification,
        params.customerId,
        params.quotationId || null,
        AgendaEventStatus.SCHEDULED,
      ];
      
      const eventResult = await queryRunner.query(createEventSql, eventParams);
      eventId = eventResult[0].id;

      // 2. Create the invitation
      const createInvitationSql = `
        INSERT INTO agenda_invitation (event_id, invitee_id, status, updated_at)
        VALUES ($1, $2, 'pending', NOW());
      `;

      const invitationParams = [
        eventId,
        params.customerId,
      ];
      
      await queryRunner.query(createInvitationSql, invitationParams);

      // 3. Create the history record
      await queryRunner.query(
        `INSERT INTO agenda_event_history (
          event_id, title, start_date, end_date, color, info, notification, 
          done, status, recorded_at, updated_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)`,
        [
          eventId,
          params.title,
          params.startDate,
          params.endDate,
          params.color,
          params.info,
          params.notification,
          false, // done
          AgendaEventStatus.SCHEDULED, // status
          params.createdBy,
        ],
      );

      await queryRunner.commitTransaction();
      transactionIsOK = true;
      
      this.logger.log(`Created event with ID ${eventId} and associated history record`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create event with history', error);
    } finally {
      await queryRunner.release();
    }

    return { transactionIsOK, eventId };
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
        status: AgendaEventStatus.SCHEDULED,
        timestamp: new Date(),
        actor: {
          userId: 'system_sync_processor',
          roleId: quotationId,
          role: 'system',
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
        status: AgendaEventStatus.SCHEDULED,
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
    initialStatus: AgendaEventStatus = AgendaEventStatus.SCHEDULED,
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