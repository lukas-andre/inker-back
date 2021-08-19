import { Injectable } from '@nestjs/common';
import { Point } from 'geojson';
import { BaseUseCase } from 'src/global/domain/usecases/base.usecase';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { ArtistLocationsService } from '../domain/artistLocations.service';
import { AddLocationDto } from '../infrastructure/dtos/addLocation.dto';
import { ArtistLocation } from '../infrastructure/entities/artistLocation.entity';

@Injectable()
export class AddLocationByApiUseCase extends BaseUseCase {
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
        longitud: addLocationDto.longitud,
        latitud: addLocationDto.latitud,
        location: {
          type: 'Point',
          coordinates: [addLocationDto.latitud, addLocationDto.longitud],
        } as Point,
      });
    } catch (error) {
      this.logger.log(`Error: ${error.message}`);
      return new DomainConflictException(`Could not save location `);
    }
  }
}
