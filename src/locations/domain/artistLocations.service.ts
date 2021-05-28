import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindManyOptions,
  FindOneOptions,
  DeepPartial,
  DeleteResult,
} from 'typeorm';
import { ArtistLocation } from '../infrastructure/entities/artistLocation.entity';

@Injectable()
export class ArtistLocationsService {
  private readonly serviceName: string = ArtistLocationsService.name;

  constructor(
    @InjectRepository(ArtistLocation, 'location-db')
    private readonly artistLocationsRepository: Repository<ArtistLocation>,
  ) {}

  async findById(id: string) {
    return this.artistLocationsRepository.findOne(id);
  }

  async find(options: FindManyOptions<ArtistLocation>) {
    return this.artistLocationsRepository.find(options);
  }

  async findAndCount(options: FindManyOptions<ArtistLocation>) {
    return this.artistLocationsRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<ArtistLocation>,
  ): Promise<ArtistLocation | undefined> {
    return this.artistLocationsRepository.findOne(options);
  }

  async save(location: DeepPartial<ArtistLocation>): Promise<ArtistLocation> {
    return this.artistLocationsRepository.save(location);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.artistLocationsRepository.delete(id);
  }
}
