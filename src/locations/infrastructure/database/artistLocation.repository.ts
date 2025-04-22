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

import { BaseComponent } from '../../../global/domain/components/base.component';
import {
  DBServiceFindException,
  DBServiceSaveException,
} from '../../../global/infrastructure/exceptions/dbService.exception';
import { TROUBLE_SAVING_LOCATION } from '../../../users/domain/errors/codes';
import { TROUBLE_FINDING_LOCATIONS } from '../../domain/codes/codes';
import { ArtistLocationCreateDto, ArtistLocationUpdateDto } from '../../domain/interfaces/artistLocation.interface';
import { FindArtistByRangeResponseDTO } from '../dtos/findArtistByRangeResponse.dto';
import { ArtistLocation } from './entities/artistLocation.entity';

@Injectable()
export class ArtistLocationRepository extends BaseComponent {
  constructor(
    @InjectRepository(ArtistLocation, 'location-db')
    private readonly artistLocationsRepository: Repository<ArtistLocation>,
  ) {
    super(ArtistLocationRepository.name);
  }

  get repo(): Repository<ArtistLocation> {
    return this.artistLocationsRepository;
  }

  async findById(id: string) {
    try {
      return await this.artistLocationsRepository.findOne({ where: { id } });
    } catch (error) {
      throw new DBServiceFindException(this, TROUBLE_FINDING_LOCATIONS, error);
    }
  }

  async find(options: FindManyOptions<ArtistLocation>) {
    try {
      return await this.artistLocationsRepository.find(options);
    } catch (error) {
      throw new DBServiceFindException(this, TROUBLE_FINDING_LOCATIONS, error);
    }
  }

  async findByArtistId(artistId: string) {
    try {
      return await this.artistLocationsRepository.find({
        where: { artistId, isActive: true },
        order: { locationOrder: 'ASC' },
      });
    } catch (error) {
      throw new DBServiceFindException(this, TROUBLE_FINDING_LOCATIONS, error);
    }
  }

  async countByArtistId(artistId: string): Promise<number> {
    try {
      return await this.artistLocationsRepository.count({
        where: { artistId, isActive: true },
      });
    } catch (error) {
      throw new DBServiceFindException(this, TROUBLE_FINDING_LOCATIONS, error);
    }
  }

  async findByRange(
    originPoint: Point,
    range = 1000,
  ): Promise<FindArtistByRangeResponseDTO[]> {
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
        .getRawMany<FindArtistByRangeResponseDTO>();
    } catch (error) {
      throw new DBServiceFindException(this, TROUBLE_FINDING_LOCATIONS, error);
    }
  }

  async findAndCount(options: FindManyOptions<ArtistLocation>) {
    try {
      return await this.artistLocationsRepository.findAndCount(options);
    } catch (error) {
      throw new DBServiceFindException(this, TROUBLE_FINDING_LOCATIONS, error);
    }
  }

  async findOne(
    options?: FindOneOptions<ArtistLocation>,
  ): Promise<ArtistLocation | undefined> {
    try {
      return await this.artistLocationsRepository.findOne(options);
    } catch (error) {
      throw new DBServiceFindException(this, TROUBLE_FINDING_LOCATIONS, error);
    }
  }

  async create(data: ArtistLocationCreateDto): Promise<ArtistLocation> {
    try {
      const point: Point = {
        type: 'Point',
        coordinates: [data.lng, data.lat],
      };

      const artistLocation = this.artistLocationsRepository.create({
        ...data,
        location: point,
      });

      return await this.artistLocationsRepository.save(artistLocation);
    } catch (error) {
      throw new DBServiceSaveException(this, TROUBLE_SAVING_LOCATION, error);
    }
  }

  async update(data: ArtistLocationUpdateDto): Promise<ArtistLocation> {
    try {
      const artistLocation = await this.findById(data.id);
      
      if (!artistLocation) {
        return null;
      }

      // Update location point if lat/lng provided
      if (data.lat !== undefined && data.lng !== undefined) {
        const point: Point = {
          type: 'Point',
          coordinates: [data.lng, data.lat],
        };
        data.location = point;
      }

      // Update the entity
      const updatedLocation = this.artistLocationsRepository.merge(artistLocation, data);
      return await this.artistLocationsRepository.save(updatedLocation);
    } catch (error) {
      throw new DBServiceSaveException(this, TROUBLE_SAVING_LOCATION, error);
    }
  }

  async save(location: DeepPartial<ArtistLocation>): Promise<ArtistLocation> {
    try {
      const columns = Object.keys(location).filter(key => key !== 'location');
      const values = Object.values(location).filter((_, index) => Object.keys(location)[index] !== 'location');
      
      // Handle the geospatial point data
      let locationPoint = null;
      if (location.lat !== undefined && location.lng !== undefined) {
        locationPoint = {
          type: 'Point',
          coordinates: [location.lng, location.lat],
        };
      } else if (location.location) {
        locationPoint = location.location;
      }
      
      // Build placeholders for the query
      const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
      
      // Build column names with proper snake_case conversion for DB
      const columnNames = columns.map(col => {
        // Convert camelCase to snake_case for DB columns
        return col.replace(/([A-Z])/g, '_$1').toLowerCase();
      }).join(', ');
      
      let query = `
        INSERT INTO artist_location (${columnNames}`;
      
      // Add location column if point data exists
      if (locationPoint) {
        query += `, location`;
      }
      
      query += `) VALUES (${placeholders}`;
      
      // Add the ST_SetSRID function for the point if it exists
      if (locationPoint) {
        query += `, ST_SetSRID(ST_GeomFromGeoJSON($${columns.length + 1}), 4326)`;
        values.push(JSON.stringify(locationPoint));
      }
      
      query += `) 
        RETURNING 
          id, 
          artist_id AS "artistId", 
          name,
          lat,
          lng,
          address1,
          address2, 
          address3,
          city,
          country,
          address_type AS "addressType",
          formatted_address AS "formattedAddress",
          profile_thumbnail AS "profileThumbnail",
          google_place_id AS "googlePlaceId",
          location_order AS "locationOrder",
          is_active AS "isActive",
          created_at AS "createdAt",
          updated_at AS "updatedAt",
          ST_AsGeoJSON(location)::json AS location
      `;
      
      const result = await this.artistLocationsRepository.query(query, values);
      
      // Convert GeoJSON string to actual object and return the first result
      if (result && result.length > 0) {
        return result[0];
      }
      
      return null;
    } catch (error) {
      throw new DBServiceSaveException(this, TROUBLE_SAVING_LOCATION, error);
    }
  }

  async delete(id: string): Promise<DeleteResult> {
    try {
      return await this.artistLocationsRepository.delete(id);
    } catch (error) {
      throw new DBServiceSaveException(this, TROUBLE_SAVING_LOCATION, error);
    }
  }
}
