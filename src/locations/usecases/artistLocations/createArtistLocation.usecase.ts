import { BadRequestException, Injectable } from '@nestjs/common';

import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { ArtistLocationCreateDto, ArtistLocationDto } from '../../domain/interfaces/artistLocation.interface';
import { ArtistLocationProvider } from '../../infrastructure/database/artistLocation.provider';

@Injectable()
export class CreateArtistLocationUseCase extends BaseUseCase {
  constructor(
    private readonly artistLocationProvider: ArtistLocationProvider,
  ) {
    super(CreateArtistLocationUseCase.name);
  }

  async execute(data: ArtistLocationCreateDto): Promise<ArtistLocationDto> {
    this.logger.log('Creating artist location', { data });

    try {
      // Validate required fields
      if (!data.artistId || !data.name || !data.address1 || !data.address2 || !data.city || data.lat === undefined || data.lng === undefined) {
        throw new BadRequestException('Missing required fields for artist location');
      }

      // Check location count limit (3)
      const locationCount = await this.artistLocationProvider.countByArtistId(data.artistId);
      if (locationCount >= 3) {
        throw new BadRequestException('Artist cannot have more than 3 locations');
      }

      // Set the locationOrder if not provided
      if (data.locationOrder === undefined) {
        data.locationOrder = locationCount;
      }

      // Create the artist location
      const artistLocation = await this.artistLocationProvider.create(data);
      return artistLocation;
    } catch (error) {
      this.logger.error('Error creating artist location', { error });
      throw error;
    }
  }
}