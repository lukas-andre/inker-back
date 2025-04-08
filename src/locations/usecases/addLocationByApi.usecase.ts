import { Injectable } from '@nestjs/common';
import { Point } from 'geojson';

import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { ArtistLocationRepository } from '../infrastructure/database/artistLocation.repository';
import { AddLocationDto } from '../infrastructure/dtos/addLocation.dto';
import { ArtistLocation } from '../infrastructure/database/entities/artistLocation.entity';

@Injectable()
export class AddLocationByApiUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly artistLocationProvider: ArtistLocationRepository) {
    super(AddLocationByApiUseCase.name);
  }

  async execute(addLocationDto: AddLocationDto): Promise<ArtistLocation> {
    return this.artistLocationProvider.save({
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
  }
}
