import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';

import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { DeleteArtistLocationParams } from '../../domain/interfaces/artistLocation.interface';
import { ArtistLocationProvider } from '../../infrastructure/database/artistLocation.provider';

@Injectable()
export class DeleteArtistLocationUseCase extends BaseUseCase {
  constructor(
    private readonly artistLocationProvider: ArtistLocationProvider,
  ) {
    super(DeleteArtistLocationUseCase.name);
  }

  async execute(params: DeleteArtistLocationParams): Promise<boolean> {
    this.logger.log('Deleting artist location', { params });

    try {
      // Validate required fields
      if (!params.id) {
        throw new BadRequestException('Location ID is required');
      }

      // Verify location belongs to the artist
      const location = await this.artistLocationProvider.findById(params.id);
      if (!location) {
        return false;
      }
      
      if (location.artistId !== params.artistId) {
        throw new ForbiddenException('You do not have permission to delete this location');
      }

      // Check if this is the last location for the artist
      const locationCount = await this.artistLocationProvider.countByArtistId(params.artistId);
      if (locationCount <= 1) {
        throw new BadRequestException('Cannot delete the last location. Artists must have at least one location.');
      }

      // Delete the artist location
      const result = await this.artistLocationProvider.delete(params.id);
      return result && result.affected > 0;
    } catch (error) {
      this.logger.error('Error deleting artist location', { error });
      throw error;
    }
  }
}