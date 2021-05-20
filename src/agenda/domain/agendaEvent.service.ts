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

  async findById(id: string) {
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

  async delete(id: string): Promise<DeleteResult> {
    return this.agendaEventRepository.delete(id);
  }

  async existEventBetweenStartDateAndEndDate(
    agendaId: number,
    date: string,
    eventId?: number,
  ): Promise<boolean | ServiceError> {
    const qb = await this.agendaEventRepository
      .createQueryBuilder('agenda_event')
      .select('COUNT(agenda_event.id)')
      .where(`(:date > agenda_event.start AND :date < agenda_event.end)`, {
        date,
      })
      .andWhere('agenda_event.agenda_id = :agendaId', { agendaId });

    if (eventId) {
      qb.andWhere('agenda_event.id != :eventId', { eventId });
    }

    try {
      const result = await qb.getRawOne<{ count: string }>();
      console.log('result', result);
      return !!Number(result.count);
    } catch (error) {
      const serviceError: ServiceError = {
        error: 'Trouble finding available event date ',
        method: this.existEventBetweenStartDateAndEndDate.name,
        subject: this.serviceName,
      };
      return serviceError;
    }
  }
}
