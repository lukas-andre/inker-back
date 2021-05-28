import { Injectable, Logger } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { ArtistLocationsService } from '../domain/artistLocations.service';
import { FindArtistByArtistDto } from '../infrastructure/dtos/findArtistByRange.dto';
import { handleServiceError } from '../../global/domain/utils/handleServiceError';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { ArtistsService } from '../../artists/domain/services/artists.service';
import { Point } from 'geojson';
import { logCatchedError } from 'src/global/domain/utils/logCatchedError';

@Injectable()
export class FindArtistByRangeUseCase {
  private readonly logger = new Logger(FindArtistByRangeUseCase.name);

  constructor(
    private readonly artistsLocationService: ArtistLocationsService,
    private readonly artistsService: ArtistsService,
  ) {}

  async execute(
    findArtistByArtistDto: FindArtistByArtistDto,
  ): Promise<any | DomainException> {
    const origin: Point = {
      type: 'Point',
      coordinates: [
        findArtistByArtistDto.latitud,
        findArtistByArtistDto.longitud,
      ],
    };

    const result = await this.artistsLocationService.findByRange(
      origin,
      findArtistByArtistDto.range,
    );

    if (isServiceError(result)) {
      return new DomainConflictException(
        handleServiceError(result, this.logger),
      );
    }

    try {
      const artists = await this.artistsService.findByIds(
        result.map((location) => location.location_artist_id),
      );

      result.forEach((location) => {
        location.artist = artists.filter(
          (artist) => artist.id === location.location_artist_id,
        );
      });

      return result;
    } catch (error) {
      logCatchedError(error, this.logger);
      return new DomainConflictException('Troubles in Artist Service');
    }
  }
}
