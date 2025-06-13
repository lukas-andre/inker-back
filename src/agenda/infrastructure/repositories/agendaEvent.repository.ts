import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { paginate } from 'nestjs-typeorm-paginate';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import { TypeTransform } from '../../../global/domain/utils/typeTransform';
import {
  DBServiceCreateException,
  DBServiceSaveException,
  DBServiceUpdateException,
  DbServiceNotFound,
} from '../../../global/infrastructure/exceptions/dbService.exception';
import { MultimediasMetadataInterface } from '../../../multimedias/interfaces/multimediasMetadata.interface';
import { AddEventReqDto } from '../dtos/addEventReq.dto';
import { Agenda } from '../entities/agenda.entity';
import { AgendaEvent } from '../entities/agendaEvent.entity';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';

class FindAgendaEventForMarkAsDoneQueryResult {
  @Expose()
  @IsString()
  @IsNotEmpty()
  agendaId: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  agendaEventId: string;

  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  done: boolean;
}
@Injectable()
export class AgendaEventRepository extends BaseComponent {
  constructor(
    @InjectRepository(AgendaEvent, AGENDA_DB_CONNECTION_NAME)
    private readonly agendaEventRepository: Repository<AgendaEvent>,
  ) {
    super(AgendaEventRepository.name);
  }

  get repo(): Repository<AgendaEvent> {
    return this.agendaEventRepository;
  }

  async paginate(artistId: string, page: number, limit: number) {
    const queryBuilder = this.agendaEventRepository
      .createQueryBuilder('agendaEvent')
      .leftJoin('agendaEvent.agenda', 'agenda')
      .where('agenda.artistId = :artistId', { artistId })
      .orderBy('agendaEvent.createdAt', 'DESC');

    return await paginate<AgendaEvent>(queryBuilder, { page, limit });
  }

  async exists(id: string): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] =
      await this.agendaEventRepository.query(
        `SELECT EXISTS(SELECT 1 FROM agenda_event a WHERE a.id = $1)`,
        [id],
      );

    return result.exists;
  }

  async findById(id: string) {
    return this.agendaEventRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<AgendaEvent>) {
    return this.agendaEventRepository.find(options);
  }

  async findByKey(findConditions: FindOptionsWhere<AgendaEvent>) {
    return this.agendaEventRepository.find({
      select: ['id', 'createdAt', 'updatedAt'],
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<AgendaEvent>) {
    return this.agendaEventRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<AgendaEvent>,
  ): Promise<AgendaEvent | undefined> {
    try {
      return await this.agendaEventRepository.findOne(options);
    } catch (error) {
      throw new DbServiceNotFound(this, 'Trouble finding event', error);
    }
  }

  async save(agendaEvent: DeepPartial<AgendaEvent>): Promise<AgendaEvent> {
    try {
      return await this.agendaEventRepository.save(agendaEvent);
    } catch (error) {
      throw new DBServiceSaveException(this, 'Trouble saving event', error);
    }
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.agendaEventRepository.delete(id);
  }

  async softDelete(id: string): Promise<DeleteResult> {
    return this.agendaEventRepository.softDelete(id);
  }

  async existEventBetweenStartDateAndEndDate(
    agendaId: string,
    startDate: string,
    endDate: string,
    eventId?: string,
  ): Promise<boolean> {
    const qb = this.agendaEventRepository
      .createQueryBuilder('agenda_event')
      .select('COUNT(agenda_event.id)')
      .where(
        `(:start > agenda_event.start_date AND :start < agenda_event.end_date)`,
        {
          start: startDate,
        },
      )
      .orWhere(
        `(:end > agenda_event.start_date AND :end < agenda_event.end_date)`,
        {
          end: endDate,
        },
      )
      .orWhere(
        `(:start = agenda_event.start_date AND :end = agenda_event.end_date)`,
        {
          start: startDate,
          end: endDate,
        },
      )
      .andWhere('agenda_event.agenda_id = :agendaId', { agendaId });

    if (eventId) {
      qb.andWhere('agenda_event.id != :eventId', { eventId });
    }

    try {
      const { count } = await qb.getRawOne<{ count: string }>();
      return !!Number(count);
    } catch (error) {
      throw new DbServiceNotFound(
        this,
        'Trouble checking if event exists',
        error,
      );
    }
  }

  async findByDateRange(
    agendaId: string,
    start: string,
    end: string,
  ): Promise<AgendaEvent[]> {
    const qb = this.agendaEventRepository
      .createQueryBuilder('agenda_event')
      .select()
      .where(`agenda_event.start_date BETWEEN :start and :end`, {
        start,
        end,
      })
      .andWhere('agenda_event.agenda_id = :agendaId', { agendaId });

    try {
      return await qb.getMany();
    } catch (error) {
      throw new DbServiceNotFound(
        this,
        'Trouble finding events in dates range',
        error,
      );
    }
  }

  async saveWithAddEventDto(
    dto: AddEventReqDto,
    agenda: Agenda,
  ): Promise<AgendaEvent> {
    try {
      return await this.save({
        agenda,
        title: dto.title,
        info: dto.info,
        color: dto.color,
        endDate: dto.end as any,
        startDate: dto.start as any,
        notification: dto.notification,
        customerId: dto.customerId,
      });
    } catch (error) {
      throw new DBServiceCreateException(this, 'Trouble saving event', error);
    }
  }

  async findAgendaEventForMarkAsDone(
    agendaId: string,
    eventId: string,
  ): Promise<FindAgendaEventForMarkAsDoneQueryResult> {
    const [result]: unknown[] = await this.agendaEventRepository.query(
      `SELECT id as "agendaEventId", agenda_id as "agendaId", done 
        FROM agenda_event WHERE agenda_id = $1 AND id = $2`,
      [agendaId, eventId],
    );

    const event = await TypeTransform.queryResultTo(
      FindAgendaEventForMarkAsDoneQueryResult,
      result,
    );

    return event;
  }

  async markAsDone(
    agendaId: string,
    eventId: string,
    workEvidence: MultimediasMetadataInterface,
  ): Promise<void> {
    try {
      await this.agendaEventRepository
        .createQueryBuilder()
        .update()
        .set({
          done: true,
          workEvidence,
          status: AgendaEventStatus.WAITING_FOR_REVIEW,
        })
        .where('id = :id', { id: eventId })
        .andWhere('agenda_id = :agendaId', { agendaId })
        .execute();
    } catch (error) {
      throw new DBServiceUpdateException(
        this,
        'Trouble marking event as done',
        error,
      );
    }
  }
  
  async updateEventStatus(
    eventId: string,
    agendaId: string,
    status: AgendaEventStatus,
  ): Promise<void> {
    try {
      await this.agendaEventRepository
        .createQueryBuilder()
        .update()
        .set({ status })
        .where('id = :id', { id: eventId })
        .andWhere('agenda_id = :agendaId', { agendaId })
        .execute();
    } catch (error) {
      throw new DBServiceUpdateException(
        this,
        'Trouble updating event status',
        error,
      );
    }
  }

  async createEventWithNativeQuery(dto: AddEventReqDto): Promise<AgendaEvent> {
    try {
      const insertedEvent = await this.agendaEventRepository.query(
        `INSERT INTO agenda_event (agenda_id, title, info, color, start_date, end_date, notification, customer_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, agenda_id AS "agendaId", title, info, color, start_date, end_date, notification, customer_id AS "customerId"`, // Usar alias para adaptar a camelCase
        [
          dto.agendaId,
          dto.title,
          dto.info,
          dto.color,
          dto.start,
          dto.end,
          dto.notification,
          dto.customerId,
        ],
      );
      return insertedEvent[0];
    } catch (error) {
      throw new DBServiceCreateException(
        this,
        'Trouble creating event with native query',
        error,
      );
    }
  }

  async findByArtistId(agendaId: string): Promise<AgendaEvent[]> {
    return this.agendaEventRepository
      .createQueryBuilder('agenda_event')
      .where('agenda_id = :agendaId', { agendaId })
      .getMany();
  }

  async findByCustomerId(customerId: string): Promise<AgendaEvent[]> {
    return this.agendaEventRepository
      .createQueryBuilder('agenda_event')
      .where('customer_id = :customerId', { customerId })
      .getMany();
  }

  async findEventByAgendaIdAndEventId(
    agendaId: string,
    eventId: string,
  ): Promise<AgendaEvent> {
    return this.agendaEventRepository
      .createQueryBuilder('agenda_event')
      .where('agenda_id = :agendaId', { agendaId })
      .andWhere('id = :eventId', { eventId })
      .getOne();
  }

  async update(id: string, agendaEvent: DeepPartial<AgendaEvent>){
    return this.agendaEventRepository.update(id, agendaEvent);
  }

  /**
   * Find events in a specific time window for reminders using native SQL
   */
  async findEventsForReminder(
    startTime: string,
    endTime: string,
    statuses: AgendaEventStatus[]
  ): Promise<AgendaEvent[]> {
    try {
      const statusPlaceholders = statuses.map((_, i) => `$${i + 3}`).join(', ');
      
      const events = await this.agendaEventRepository.query(
        `SELECT 
          ae.id,
          ae.agenda_id as "agendaId",
          ae.title,
          ae.info,
          ae.start_date as "startDate",
          ae.end_date as "endDate",
          ae.status,
          ae.customer_id as "customerId",
          ae.quotation_id as "quotationId",
          ae.review_id as "reviewId",
          ae.created_at as "createdAt",
          ae.updated_at as "updatedAt",
          ae.reminder_sent as "reminderSent",
          json_build_object(
            'id', a.id,
            'artistId', a.artist_id
          ) as agenda
        FROM agenda_event ae
        INNER JOIN agenda a ON ae.agenda_id = a.id
        WHERE ae.start_date >= $1 
          AND ae.start_date <= $2
          AND ae.status IN (${statusPlaceholders})
          AND ae.deleted_at IS NULL
        ORDER BY ae.start_date ASC`,
        [startTime, endTime, ...statuses]
      );

      return events;
    } catch (error) {
      throw new DbServiceNotFound(
        this,
        'Trouble finding events for reminder',
        error,
      );
    }
  }

  /**
   * Find events needing consent reminders
   */
  async findEventsNeedingConsentReminder(
    startTime: string,
    endTime: string
  ): Promise<AgendaEvent[]> {
    try {
      const events = await this.agendaEventRepository.query(
        `SELECT 
          ae.id,
          ae.agenda_id as "agendaId",
          ae.title,
          ae.start_date as "startDate",
          ae.end_date as "endDate",
          ae.status,
          ae.customer_id as "customerId",
          ae.quotation_id as "quotationId",
          json_build_object(
            'artistId', a.artist_id
          ) as agenda
        FROM agenda_event ae
        INNER JOIN agenda a ON ae.agenda_id = a.id
        LEFT JOIN signed_consent sc ON sc.event_id = ae.id AND sc.user_id = ae.customer_id
        WHERE ae.start_date >= $1 
          AND ae.start_date <= $2
          AND ae.status IN ($3, $4)
          AND sc.id IS NULL
          AND ae.deleted_at IS NULL`,
        [startTime, endTime, AgendaEventStatus.CONFIRMED, AgendaEventStatus.PENDING_CONFIRMATION]
      );

      return events;
    } catch (error) {
      throw new DbServiceNotFound(
        this,
        'Trouble finding events needing consent reminder',
        error,
      );
    }
  }

  /**
   * Find events in PENDING_CONFIRMATION status older than specified hours
   */
  async findPendingConfirmationEvents(hoursOld: number): Promise<AgendaEvent[]> {
    try {
      const cutoffTime = new Date(Date.now() - (hoursOld * 60 * 60 * 1000)).toISOString();
      
      const events = await this.agendaEventRepository.query(
        `SELECT 
          ae.id,
          ae.agenda_id as "agendaId",
          ae.title,
          ae.start_date as "startDate",
          ae.status,
          ae.customer_id as "customerId",
          ae.created_at as "createdAt",
          ae.status_log as "statusLog",
          json_build_object(
            'artistId', a.artist_id
          ) as agenda
        FROM agenda_event ae
        INNER JOIN agenda a ON ae.agenda_id = a.id
        WHERE ae.status = $1
          AND ae.created_at <= $2
          AND ae.deleted_at IS NULL`,
        [AgendaEventStatus.PENDING_CONFIRMATION, cutoffTime]
      );

      return events;
    } catch (error) {
      throw new DbServiceNotFound(
        this,
        'Trouble finding pending confirmation events',
        error,
      );
    }
  }

  /**
   * Find completed events needing review reminder
   */
  async findCompletedEventsForReview(
    startTime: string,
    endTime: string
  ): Promise<AgendaEvent[]> {
    try {
      const events = await this.agendaEventRepository.query(
        `SELECT 
          ae.id,
          ae.agenda_id as "agendaId",
          ae.title,
          ae.start_date as "startDate",
          ae.end_date as "endDate",
          ae.status,
          ae.customer_id as "customerId",
          ae.review_id as "reviewId",
          json_build_object(
            'artistId', a.artist_id
          ) as agenda
        FROM agenda_event ae
        INNER JOIN agenda a ON ae.agenda_id = a.id
        WHERE ae.end_date >= $1 
          AND ae.end_date <= $2
          AND ae.status IN ($3, $4)
          AND ae.review_id IS NULL
          AND ae.deleted_at IS NULL`,
        [startTime, endTime, AgendaEventStatus.COMPLETED, AgendaEventStatus.WAITING_FOR_REVIEW]
      );

      return events;
    } catch (error) {
      throw new DbServiceNotFound(
        this,
        'Trouble finding completed events for review',
        error,
      );
    }
  }

  /**
   * Find events needing photo upload reminder
   */
  async findEventsNeedingPhotos(
    startTime: string,
    endTime: string
  ): Promise<AgendaEvent[]> {
    try {
      const events = await this.agendaEventRepository.query(
        `SELECT 
          ae.id,
          ae.agenda_id as "agendaId",
          ae.title,
          ae.start_date as "startDate",
          ae.end_date as "endDate",
          ae.status,
          ae.customer_id as "customerId",
          ae.work_evidence as "workEvidence",
          json_build_object(
            'artistId', a.artist_id
          ) as agenda
        FROM agenda_event ae
        INNER JOIN agenda a ON ae.agenda_id = a.id
        WHERE ae.end_date >= $1 
          AND ae.end_date <= $2
          AND ae.status IN ($3, $4)
          AND (ae.work_evidence IS NULL OR ae.work_evidence = '{}')
          AND ae.deleted_at IS NULL`,
        [startTime, endTime, AgendaEventStatus.COMPLETED, AgendaEventStatus.WAITING_FOR_PHOTOS]
      );

      return events;
    } catch (error) {
      throw new DbServiceNotFound(
        this,
        'Trouble finding events needing photos',
        error,
      );
    }
  }

  /**
   * Mark specific reminder types as sent for given events using native SQL
   */
  async markRemindersAsSent(eventIds: string[], reminderType: string): Promise<void> {
    if (eventIds.length === 0) return;

    try {
      const placeholders = eventIds.map((_, i) => `$${i + 2}`).join(', ');
      
      await this.agendaEventRepository.query(
        `UPDATE agenda_event 
         SET reminder_sent = COALESCE(reminder_sent, '{}'::jsonb) || $1::jsonb
         WHERE id IN (${placeholders})`,
        [
          JSON.stringify({ [reminderType]: true }),
          ...eventIds
        ]
      );

      this.logger.log(`Marked ${reminderType} as sent for ${eventIds.length} events`);
    } catch (error) {
      this.logger.error(`Error marking reminders as sent:`, error);
      throw error;
    }
  }

  /**
   * Check if a reminder has been sent for an event
   */
  async hasReminderBeenSent(eventId: string, reminderType: string): Promise<boolean> {
    try {
      const [result] = await this.agendaEventRepository.query(
        `SELECT reminder_sent->$2 as sent
         FROM agenda_event 
         WHERE id = $1`,
        [eventId, reminderType]
      );

      return result?.sent === true;
    } catch (error) {
      this.logger.error(`Error checking reminder status:`, error);
      return false;
    }
  }

  /**
   * Get events with basic info for monthly reports
   */
  async getEventsForMonthlyReport(
    artistIds: string[],
    year: number,
    month: number
  ): Promise<any[]> {
    if (artistIds.length === 0) return [];

    try {
      const placeholders = artistIds.map((_, i) => `$${i + 3}`).join(', ');
      
      const events = await this.agendaEventRepository.query(
        `SELECT 
          a.artist_id as "artistId",
          json_build_object(
            'completedCount', COUNT(*) FILTER (WHERE ae.status = 'COMPLETED'),
            'canceledCount', COUNT(*) FILTER (WHERE ae.status = 'CANCELED'),
            'rescheduledCount', COUNT(*) FILTER (WHERE ae.status = 'RESCHEDULED'),
            'totalCount', COUNT(*),
            'uniqueCustomers', COUNT(DISTINCT ae.customer_id)
          ) as summary
        FROM agenda_event ae
        INNER JOIN agenda a ON ae.agenda_id = a.id
        WHERE a.artist_id IN (${placeholders})
          AND EXTRACT(YEAR FROM ae.start_date) = $1
          AND EXTRACT(MONTH FROM ae.start_date) = $2
          AND ae.deleted_at IS NULL
        GROUP BY a.artist_id`,
        [year, month, ...artistIds]
      );

      return events;
    } catch (error) {
      throw new DbServiceNotFound(
        this,
        'Trouble getting events for monthly report',
        error,
      );
    }
  }

  /**
   * Find events that need consent reminders (confirmed events without signed consent)
   */
  async findEventsNeedingConsent(
    startTime: string,
    endTime: string,
    statuses: AgendaEventStatus[]
  ): Promise<AgendaEvent[]> {
    try {
      const statusPlaceholders = statuses.map((_, i) => `$${i + 3}`).join(', ');
      
      const events = await this.agendaEventRepository.query(
        `SELECT 
          ae.id,
          ae.agenda_id as "agendaId",
          ae.title,
          ae.info,
          ae.start_date as "startDate",
          ae.end_date as "endDate",
          ae.status,
          ae.customer_id as "customerId",
          ae.location_id as "locationId",
          ae.quotation_id as "quotationId",
          ae.reminder_sent as "reminderSent",
          json_build_object(
            'artistId', a.artist_id
          ) as agenda
        FROM agenda_event ae
        INNER JOIN agenda a ON ae.agenda_id = a.id
        LEFT JOIN signed_consent sc ON sc.event_id = ae.id
        WHERE ae.start_date BETWEEN $1 AND $2
          AND ae.status IN (${statusPlaceholders})
          AND sc.id IS NULL  -- No consent signed yet
        ORDER BY ae.start_date ASC`,
        [startTime, endTime, ...statuses]
      );

      return events.map(event => ({
        ...event,
        artistId: event.agenda.artistId,
      }));
    } catch (error) {
      this.logger.error('Error finding events needing consent:', error);
      throw error;
    }
  }

  /**
   * Find events by status
   */
  async findEventsByStatus(statuses: AgendaEventStatus[]): Promise<AgendaEvent[]> {
    try {
      const statusPlaceholders = statuses.map((_, i) => `$${i + 1}`).join(', ');
      
      const events = await this.agendaEventRepository.query(
        `SELECT 
          ae.id,
          ae.agenda_id as "agendaId",
          ae.title,
          ae.info,
          ae.start_date as "startDate",
          ae.end_date as "endDate",
          ae.status,
          ae.customer_id as "customerId",
          ae.quotation_id as "quotationId",
          ae.created_at as "createdAt",
          ae.reminder_sent as "reminderSent",
          json_build_object(
            'artistId', a.artist_id
          ) as agenda
        FROM agenda_event ae
        INNER JOIN agenda a ON ae.agenda_id = a.id
        WHERE ae.status IN (${statusPlaceholders})
        ORDER BY ae.created_at ASC`,
        [...statuses]
      );

      return events.map(event => ({
        ...event,
        artistId: event.agenda.artistId,
      }));
    } catch (error) {
      this.logger.error('Error finding events by status:', error);
      throw error;
    }
  }

  /**
   * Find events that have been pending confirmation for more than 48 hours
   */
  async findExpiredPendingEvents(): Promise<AgendaEvent[]> {
    try {
      const fortyEightHoursAgo = new Date(Date.now() - (48 * 60 * 60 * 1000));
      
      const events = await this.agendaEventRepository.query(
        `SELECT 
          ae.id,
          ae.agenda_id as "agendaId",
          ae.title,
          ae.info,
          ae.start_date as "startDate",
          ae.end_date as "endDate",
          ae.status,
          ae.customer_id as "customerId",
          ae.quotation_id as "quotationId",
          ae.created_at as "createdAt",
          ae.reminder_sent as "reminderSent",
          json_build_object(
            'artistId', a.artist_id
          ) as agenda
        FROM agenda_event ae
        INNER JOIN agenda a ON ae.agenda_id = a.id
        WHERE ae.status IN ($1, $2)
          AND ae.created_at <= $3
        ORDER BY ae.created_at ASC`,
        [
          AgendaEventStatus.PENDING_CONFIRMATION,
          AgendaEventStatus.CREATED,
          fortyEightHoursAgo.toISOString()
        ]
      );

      return events.map(event => ({
        ...event,
        artistId: event.agenda.artistId,
      }));
    } catch (error) {
      this.logger.error('Error finding expired pending events:', error);
      throw error;
    }
  }

  /**
   * Find completed events that need review reminders (completed events without reviews)
   */
  async findCompletedEventsForReviewReminder(
    startTime: string,
    endTime: string,
    statuses: AgendaEventStatus[]
  ): Promise<AgendaEvent[]> {
    try {
      const statusPlaceholders = statuses.map((_, i) => `$${i + 3}`).join(', ');
      
      const events = await this.agendaEventRepository.query(
        `SELECT 
          ae.id,
          ae.agenda_id as "agendaId",
          ae.title,
          ae.info,
          ae.start_date as "startDate",
          ae.end_date as "endDate",
          ae.status,
          ae.customer_id as "customerId",
          ae.quotation_id as "quotationId",
          ae.reminder_sent as "reminderSent",
          json_build_object(
            'artistId', a.artist_id
          ) as agenda
        FROM agenda_event ae
        INNER JOIN agenda a ON ae.agenda_id = a.id
        LEFT JOIN review r ON r.event_id = ae.id
        WHERE ae.end_date BETWEEN $1 AND $2
          AND ae.status IN (${statusPlaceholders})
          AND r.id IS NULL  -- No review exists yet
        ORDER BY ae.end_date ASC`,
        [startTime, endTime, ...statuses]
      );

      return events.map(event => ({
        ...event,
        artistId: event.agenda.artistId,
      }));
    } catch (error) {
      this.logger.error('Error finding completed events for review reminder:', error);
      throw error;
    }
  }
}
