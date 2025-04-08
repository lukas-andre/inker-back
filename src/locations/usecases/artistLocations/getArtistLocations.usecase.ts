import { BadRequestException, Injectable } from '@nestjs/common';

import { ArtistLocationDto, GetArtistLocationsParams } from '../../domain/interfaces/artistLocation.interface';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { ArtistLocationRepository } from '../../infrastructure/database/artistLocation.repository';

@Injectable()
export class GetArtistLocationsUseCase extends BaseUseCase {
  constructor(
    private readonly artistLocationProvider: ArtistLocationRepository,
  ) {
    super(GetArtistLocationsUseCase.name);
  }

  async execute(params: GetArtistLocationsParams): Promise<ArtistLocationDto[]> {
    this.logger.log('Getting artist locations', { params });

    try {
      // Validate required fields
      if (!params.artistId) {
        throw new BadRequestException('Artist ID is required');
      }

      // Get artist locations
      const artistLocations = await this.artistLocationProvider.findByArtistId(params.artistId);
      return artistLocations;
    } catch (error) {
      this.logger.error('Error getting artist locations', { error });
      throw error;
    }
  }
}