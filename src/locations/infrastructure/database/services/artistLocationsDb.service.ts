import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import stringify from 'fast-safe-stringify';
import { Point } from 'geojson';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { ServiceError } from '../../../../global/domain/interfaces/serviceError';
import { ArtistByRangeLocation } from '../../../usecases/interfaces/artistByRange.interface';
import { ArtistLocation } from '../../entities/artistLocation.entity';

@Injectable()
export class ArtistLocationsDbService {
  private readonly serviceName: string = ArtistLocationsDbService.name;
  private readonly logger = new Logger(this.serviceName);
  constructor(
    @InjectRepository(ArtistLocation, 'location-db')
    private readonly artistLocationsRepository: Repository<ArtistLocation>,
  ) {}

  async findById(id: number) {
    return this.artistLocationsRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<ArtistLocation>) {
    return this.artistLocationsRepository.find(options);
  }

  async findByRange(originPoint: Point, range = 1000) {
    try {
      return this.artistLocationsRepository
        .createQueryBuilder('location')
        .select()
        .addSelect(
          'ST_Distance(location, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(location)))/1000 AS distance',
        )
        .where(
          'ST_DWithin(location, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(location)) ,:range)',
        )
        .orderBy('distance', 'ASC')
        .setParameters({
          origin: stringify(originPoint),
          range: range * 1000, // KM Conversion
        })
        .getRawMany<ArtistByRangeLocation>();
    } catch (error) {
      return {
        service: this.serviceName,
        method: this.findByRange.name,
        publicErrorMessage: 'Trouble find locations by range',
        catchedErrorMessage: error.message,
      } as ServiceError;
    }
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
