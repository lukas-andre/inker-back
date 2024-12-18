import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
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
class FindAgendaEventForMarkAsDoneQueryResult {
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  agendaId: number;

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  agendaEventId: string;

  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  done: boolean;
}
@Injectable()
export class AgendaEventProvider extends BaseComponent {
  constructor(
    @InjectRepository(AgendaEvent, AGENDA_DB_CONNECTION_NAME)
    private readonly agendaEventRepository: Repository<AgendaEvent>,
  ) {
    super(AgendaEventProvider.name);
  }

  get repo(): Repository<AgendaEvent> {
    return this.agendaEventRepository;
  }

  async paginate(artistId: number, page: number, limit: number) {
    const queryBuilder = this.agendaEventRepository
      .createQueryBuilder('agendaEvent')
      .leftJoin('agendaEvent.agenda', 'agenda')
      .where('agenda.artistId = :artistId', { artistId })
      .orderBy('agendaEvent.createdAt', 'DESC');

    return await paginate<AgendaEvent>(queryBuilder, { page, limit });
  }

  async exists(id: number): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] =
      await this.agendaEventRepository.query(
        `SELECT EXISTS(SELECT 1 FROM agenda_event a WHERE a.id = $1)`,
        [id],
      );

    return result.exists;
  }

  async findById(id: number) {
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

  async softDelete(id: number): Promise<DeleteResult> {
    return this.agendaEventRepository.softDelete(id);
  }

  async existEventBetweenStartDateAndEndDate(
    agendaId: number,
    startDate: string,
    endDate: string,
    eventId?: number,
  ): Promise<boolean> {
    const qb = this.agendaEventRepository
      .createQueryBuilder('agenda_event')
      .select('COUNT(agenda_event.id)')
      .where(`(:start > agenda_event.start_date AND :start < agenda_event.end_date)`, {
        start: startDate,
      })
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
    agendaId: number,
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
    agendaId: number,
    eventId: number,
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
    agendaId: number,
    eventId: number,
    workEvidence: MultimediasMetadataInterface,
  ): Promise<void> {
    try {
      await this.agendaEventRepository
        .createQueryBuilder()
        .update()
        .set({ done: true, workEvidence })
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

  async createEventHistoryWithNativeQuery(
    eventId: number,
    previousEventData: Partial<AgendaEvent>,
    updatedBy: number,
  ): Promise<void> {
    try {
      await this.agendaEventRepository.query(
        `INSERT INTO agenda_event_history (event_id, title, start_date, end_date, color, info, notification, done, cancelation_reason, recorded_at, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)`,
        [
          eventId,
          previousEventData.title,
          previousEventData.startDate,
          previousEventData.endDate,
          previousEventData.color,
          previousEventData.info,
          previousEventData.notification,
          previousEventData.done,
          previousEventData.cancelationReason,
          updatedBy,
        ],
      );
    } catch (error) {
      throw new DBServiceCreateException(
        this,
        'Trouble creating event history with native query',
        error,
      );
    }
  }

  async findMostRecentHistoryRecord(eventId: number): Promise<AgendaEvent> {
    return this.agendaEventRepository
      .createQueryBuilder('agenda_event_history')
      .where('event_id = :eventId', { eventId })
      .orderBy('recorded_at', 'DESC')
      .getOne();
  }

  async findByArtistId(agendaId: number): Promise<AgendaEvent[]> {
    return this.agendaEventRepository
      .createQueryBuilder('agenda_event')
      .where('agenda_id = :agendaId', { agendaId })
      .getMany();
  }

  async findEventByAgendaIdAndEventId(
    agendaId: number,
    eventId: number,
  ): Promise<AgendaEvent> {
    return this.agendaEventRepository
      .createQueryBuilder('agenda_event')
      .where('agenda_id = :agendaId', { agendaId })
      .andWhere('id = :eventId', { eventId })
      .getOne();
  }
}
