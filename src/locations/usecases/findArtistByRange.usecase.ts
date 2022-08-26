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
  RawFindByArtistIdsResponse,
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

    console.time(FindArtistByRangeUseCase.name + '_findLocations');
    const locations = await this.artistsLocationDbService.findByRange(
      origin,
      findArtistByArtistDto.range,
    );
    console.timeEnd(FindArtistByRangeUseCase.name + '_findLocations');

    console.time(FindArtistByRangeUseCase.name + '_findArtists');
    const artistIds = [];
    for (let i = 0; i < locations.length; i++) {
      artistIds.push(locations[i].artistId);
    }
    const artists = await this.artistsDbService.rawFindByArtistIds(artistIds);
    console.timeEnd(FindArtistByRangeUseCase.name + '_findArtists');

    console.time(FindArtistByRangeUseCase.name + '_merge');
    const artistByArtistId: Map<number, RawFindByArtistIdsResponse> = new Map();
    for (let i = 0; i < artists.length; i++) {
      if (!artistByArtistId[artists[i].id]) {
        artistByArtistId.set(artists[i].id, artists[i]);
      }
    }

    locations.forEach(location => {
      location.artist = artistByArtistId.get(location.artistId);
    });
    console.timeEnd(FindArtistByRangeUseCase.name + '_merge');
    return locations;
  }
}
