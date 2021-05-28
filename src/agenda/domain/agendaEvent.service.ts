import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindManyOptions,
  FindConditions,
  FindOneOptions,
  DeepPartial,
  DeleteResult,
} from 'typeorm';
import { AgendaEvent } from '../intrastructure/entities/agendaEvent.entity';
import { ServiceError } from '../../global/domain/interfaces/serviceError';
@Injectable()
export class AgendaEventService {
  private readonly serviceName: string = AgendaEventService.name;
  private readonly logger = new Logger(this.serviceName);

  constructor(
    @InjectRepository(AgendaEvent, 'agenda-db')
    private readonly agendaEventRepository: Repository<AgendaEvent>,
  ) {}

  async findById(id: number) {
    return this.agendaEventRepository.findOne(id);
  }

  async find(options: FindManyOptions<AgendaEvent>) {
    return this.agendaEventRepository.find(options);
  }

  async findByKey(findConditions: FindConditions<AgendaEvent>) {
    return this.agendaEventRepository.find({
      select: ['id', 'created_at', 'updated_at'],
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
    return this.agendaEventRepository.findOne(options);
  }

  async save(agendaEvent: DeepPartial<AgendaEvent>): Promise<AgendaEvent> {
    return this.agendaEventRepository.save(agendaEvent);
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
  ): Promise<boolean | ServiceError> {
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
      return {
        service: this.serviceName,
        method: this.existEventBetweenStartDateAndEndDate.name,
        publicErrorMessage: 'Trouble finding available event date ',
        catchedErrorMessage: error.message,
      };
    }
  }

  async findByDateRange(
    agendaId: number,
    start: string,
    end: string,
  ): Promise<AgendaEvent[] | ServiceError> {
    const qb = this.agendaEventRepository
      .createQueryBuilder('agenda_event')
      .select()
      .where(`agenda_event.start BETWEEN :start and :end`, {
        start,
        end,
      })
      .andWhere('agenda_event.agenda_id = :agendaId', { agendaId });

    try {
      return qb.getMany();
    } catch (error) {
      return {
        service: this.serviceName,
        method: this.findByDateRange.name,
        publicErrorMessage: 'Trouble finding event dates in range ',
        catchedErrorMessage: error.message,
      };
    }
  }
}
