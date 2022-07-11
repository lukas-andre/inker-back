import { Injectable } from '@nestjs/common';
import { Point } from 'geojson';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { ArtistLocationsService } from '../domain/artistLocations.service';
import { AddLocationDto } from '../infrastructure/dtos/addLocation.dto';
import { ArtistLocation } from '../infrastructure/entities/artistLocation.entity';

@Injectable()
export class AddLocationByApiUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly artistsLocationService: ArtistLocationsService) {
    super(AddLocationByApiUseCase.name);
  }

  async execute(
    addLocationDto: AddLocationDto,
  ): Promise<ArtistLocation | DomainException> {
    try {
      return this.artistsLocationService.save({
        address1: addLocationDto.address1,
        address2: addLocationDto.address2,
        address3: addLocationDto.address3,
        city: addLocationDto.city,
        state: addLocationDto.state,
        country: addLocationDto.country,
        lat: addLocationDto.lng,
        lng: addLocationDto.lat,
        location: {
          type: 'Point',
          coordinates: [addLocationDto.lat, addLocationDto.lng],
        } as Point,
      });
    } catch (error) {
      this.logger.log(`Error: ${error.message}`);
      return new DomainConflictException(`Could not save location `);
    }
  }
}
