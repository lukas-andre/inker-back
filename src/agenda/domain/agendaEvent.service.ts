import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AgendaEventService {
  private readonly serviceName: string = AgendaEventService.name;

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

  async findOne(options?: FindOneOptions<AgendaEvent>): Promise<AgendaEvent | undefined> {
    return this.agendaEventRepository.findOne(options);
  }

  async save(agendaEvent: DeepPartial<AgendaEvent>): Promise<AgendaEvent> {
    return this.agendaEventRepository.save(agendaEvent);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.agendaEventRepository.delete(id);
  }
}
