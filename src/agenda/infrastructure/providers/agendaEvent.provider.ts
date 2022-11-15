import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import { BaseComponent } from '../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import {
  DBServiceCreateException,
  DbServiceNotFound,
  DBServiceSaveException,
} from '../../../global/infrastructure/exceptions/dbService.exception';
import { AddEventReqDto } from '../dtos/addEventReq.dto';
import { Agenda } from '../entities/agenda.entity';
import { AgendaEvent } from '../entities/agendaEvent.entity';

@Injectable()
export class AgendaEventProvider extends BaseComponent {
  constructor(
    @InjectRepository(AgendaEvent, 'agenda-db')
    private readonly agendaEventRepository: Repository<AgendaEvent>,
  ) {
    super(AgendaEventProvider.name);
  }

  async exists(id: number): Promise<boolean | undefined> {
    const result: ExistsQueryResult[] = await this.agendaEventRepository.query(
      `SELECT EXISTS(SELECT 1 FROM agenda_event a WHERE a.id = $1)`,
      [id],
    );

    return result.pop().exists;
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
      .where(`(:start > agenda_event.start AND :start < agenda_event.end)`, {
        start: startDate,
      })
      .orWhere(`(:end > agenda_event.start AND :end < agenda_event.end)`, {
        end: endDate,
      })
      .orWhere(`(:start = agenda_event.start AND :end = agenda_event.end)`, {
        start: startDate,
        end: endDate,
      })
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
      .where(`agenda_event.start BETWEEN :start and :end`, {
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
        end: dto.end as any,
        start: dto.start as any,
        notification: dto.notification,
      });
    } catch (error) {
      throw new DBServiceCreateException(this, 'Trouble saving event', error);
    }
  }
}
