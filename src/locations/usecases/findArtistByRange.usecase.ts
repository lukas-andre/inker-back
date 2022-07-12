import { Injectable } from '@nestjs/common';
import { Point } from 'geojson';
import { ArtistsDbService } from '../../artists/infrastructure/database/services/artistsDb.service';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { logCatchedError } from '../../global/domain/utils/logCatchedError';
import { ArtistLocationsDbService } from '../infrastructure/database/services/artistLocationsDb.service';
import { FindArtistByArtistDto } from '../infrastructure/dtos/findArtistByRange.dto';

@Injectable()
export class FindArtistByRangeUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly artistsLocationDbService: ArtistLocationsDbService,
    private readonly artistsDbService: ArtistsDbService,
  ) {
    super(FindArtistByRangeUseCase.name);
  }

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

    const result = await this.artistsLocationDbService.findByRange(
      origin,
      findArtistByArtistDto.range,
    );

    if (isServiceError(result)) {
      return new DomainConflictException(this.handleServiceError(result));
    }

    try {
      const artists = await this.artistsDbService.findByIds(
        result.map(location => location.location_artist_id),
      );

      result.forEach(location => {
        location.artist = artists.filter(
          artist => artist.id === location.location_artist_id,
        );
      });

      return result;
    } catch (error) {
      logCatchedError(error, this.logger);
      return new DomainConflictException('Troubles in Artist Service');
    }
  }
}
