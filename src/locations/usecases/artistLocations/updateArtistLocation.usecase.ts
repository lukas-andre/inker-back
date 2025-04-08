import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { ArtistLocationDto, ArtistLocationUpdateDto } from '../../domain/interfaces/artistLocation.interface';
import { ArtistLocationRepository } from '../../infrastructure/database/artistLocation.repository';

@Injectable()
export class UpdateArtistLocationUseCase extends BaseUseCase {
  constructor(
    private readonly artistLocationProvider: ArtistLocationRepository,
  ) {
    super(UpdateArtistLocationUseCase.name);
  }

  async execute(data: ArtistLocationUpdateDto): Promise<ArtistLocationDto> {
    this.logger.log('Updating artist location', { data });

    try {
      // Validate required fields
      if (!data.id) {
        throw new BadRequestException('Location ID is required');
      }

      // Get current location
      const currentLocation = await this.artistLocationProvider.findById(data.id);

      if (!currentLocation) {
        throw new NotFoundException('Location not found');
      }

      // Update the artist location
      const updatedLocation = await this.artistLocationProvider.update(data);
      return updatedLocation;
    } catch (error) {
      this.logger.error('Error updating artist location', { error });
      throw error;
    }
  }
}