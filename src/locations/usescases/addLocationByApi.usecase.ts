import { Injectable, Logger } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { ArtistLocationsService } from '../domain/artistLocations.service';
import { AddLocationDto } from '../infrastructure/dtos/addLocation.dto';
import { Geometry, Point } from 'geojson';
import { DomainConflictException } from 'src/global/domain/exceptions/domainConflict.exception';

@Injectable()
export class AddLocationByApiUseCase {
  private readonly logger = new Logger(AddLocationByApiUseCase.name);

  constructor(
    private readonly artistsLocationService: ArtistLocationsService,
  ) {}

  async execute(
    addLocationDto: AddLocationDto,
  ): Promise<any | DomainException> {
    const point: Point = {
      type: 'Point',
      coordinates: [addLocationDto.latitud, addLocationDto.longitud],
    };

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
        location: point,
      });
    } catch (error) {
      this.logger.log(`Error: ${error.message}`);
      return new DomainConflictException(`Could not save location `);
    }
  }
}
