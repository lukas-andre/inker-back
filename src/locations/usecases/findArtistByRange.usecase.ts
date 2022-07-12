import { Injectable } from '@nestjs/common';
import { Point } from 'geojson';
import { ArtistsDbService } from '../../artists/infrastructure/database/services/artistsDb.service';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
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

  async execute(findArtistByArtistDto: FindArtistByArtistDto): Promise<any> {
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

    const artists = await this.artistsDbService.findByIds(
      result.map(location => location.location_artist_id),
    );

    result.forEach(location => {
      location.artist = artists.filter(
        artist => artist.id === location.location_artist_id,
      );
    });

    return result;
  }
}
