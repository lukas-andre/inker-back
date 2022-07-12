import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { EventLocation } from '../../entities/eventLocation.entity';

@Injectable()
export class EventLocationsDbService {
  private readonly serviceName: string = EventLocationsDbService.name;

  constructor(
    @InjectRepository(EventLocation, 'location-db')
    private readonly eventLocationsRepository: Repository<EventLocation>,
  ) {}

  async findById(id: number) {
    return this.eventLocationsRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<EventLocation>) {
    return this.eventLocationsRepository.find(options);
  }

  async findAndCount(options: FindManyOptions<EventLocation>) {
    return this.eventLocationsRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<EventLocation>,
  ): Promise<EventLocation | undefined> {
    return this.eventLocationsRepository.findOne(options);
  }

  async save(location: DeepPartial<EventLocation>): Promise<EventLocation> {
    return this.eventLocationsRepository.save(location);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.eventLocationsRepository.delete(id);
  }
}
