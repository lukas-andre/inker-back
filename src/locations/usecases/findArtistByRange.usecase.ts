import { Injectable } from '@nestjs/common';
import { Point } from 'geojson';
import { ArtistsDbService } from '../../artists/infrastructure/database/services/artistsDb.service';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { ArtistLocationsDbService } from '../infrastructure/database/services/artistLocationsDb.service';
import { FindArtistByArtistDtoRequest } from '../infrastructure/dtos/findArtistByRangeRequest.dto';
import {
  FindArtistByRangeResponseDto,
  RawFindByArtistIdsResponseDto,
} from '../infrastructure/dtos/findArtistByRangeResponse.dto';

@Injectable()
export class FindArtistByRangeUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly artistsLocationDbService: ArtistLocationsDbService,
    private readonly artistsDbService: ArtistsDbService,
  ) {
    super(FindArtistByRangeUseCase.name);
  }

  async execute(
    findArtistByArtistDto: FindArtistByArtistDtoRequest,
  ): Promise<FindArtistByRangeResponseDto[]> {
    const origin: Point = {
      type: 'Point',
      coordinates: [
        findArtistByArtistDto.longitud,
        findArtistByArtistDto.latitud,
      ],
    };

    const locations = await this.artistsLocationDbService.findByRange(
      origin,
      findArtistByArtistDto.range,
    );

    const artistIds = [];
    for (let i = 0; i < locations.length; i++) {
      artistIds.push(locations[i].artistId);
    }

    const artists = await this.artistsDbService.rawFindByArtistIds(artistIds);

    const artistByArtistId: Map<number, RawFindByArtistIdsResponseDto> =
      new Map();
    for (let i = 0; i < artists.length; i++) {
      if (!artistByArtistId[artists[i].id]) {
        artistByArtistId.set(artists[i].id, artists[i]);
      }
    }

    locations.forEach(location => {
      location.artist = artistByArtistId.get(location.artistId);
    });
    return locations;
  }
}
