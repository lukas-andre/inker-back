import { Injectable } from '@nestjs/common';
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

import { BaseComponent } from '../../../../global/domain/components/base.component';
import {
  DBServiceFindException,
  DBServiceSaveException,
} from '../../../../global/infrastructure/exceptions/dbService.exception';
import { TROUBLE_SAVING_LOCATION } from '../../../../users/domain/errors/codes';
import { TROUBLE_FINDING_LOCATIONS } from '../../../domain/codes/codes';
import { FindArtistByRangeResponseDto } from '../../dtos/findArtistByRangeResponse.dto';
import { ArtistLocation } from '../../entities/artistLocation.entity';

@Injectable()
export class ArtistLocationsDbService extends BaseComponent {
  constructor(
    @InjectRepository(ArtistLocation, 'location-db')
    private readonly artistLocationsRepository: Repository<ArtistLocation>,
  ) {
    super(ArtistLocationsDbService.name);
  }

  async findById(id: number) {
    return this.artistLocationsRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<ArtistLocation>) {
    return this.artistLocationsRepository.find(options);
  }

  async findByRange(
    originPoint: Point,
    range = 1000,
  ): Promise<FindArtistByRangeResponseDto[]> {
    try {
      return await this.artistLocationsRepository
        .createQueryBuilder('location')
        .select('id')
        .addSelect('artist_id', 'artistId')
        .addSelect('name')
        .addSelect('country')
        .addSelect('address1')
        .addSelect('address2')
        .addSelect('address3')
        .addSelect('lat')
        .addSelect('lng')
        .addSelect('address_type', 'addressType')
        .addSelect('formatted_address', 'formattedAddress')
        .addSelect('city')
        .addSelect('google_place_id', 'googlePlaceId')
        .addSelect(`'Km'`, 'distanceUnit')
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
        .getRawMany<FindArtistByRangeResponseDto>();
    } catch (error) {
      throw new DBServiceFindException(this, TROUBLE_FINDING_LOCATIONS, error);
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
    try {
      return await this.artistLocationsRepository.save(location);
    } catch (error) {
      throw new DBServiceSaveException(this, TROUBLE_SAVING_LOCATION, error);
    }
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.artistLocationsRepository.delete(id);
  }
}
