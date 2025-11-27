import { Injectable } from '@nestjs/common';
import { Point } from 'geojson';

import { ArtistRepository } from '../../artists/infrastructure/repositories/artist.repository';
import { FollowingsRepository } from '../../follows/infrastructure/database/followings.repository';
import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import {
  ReviewAvgByArtistIdsResult,
  ReviewAvgRepository,
} from '../../reviews/database/repositories/reviewAvg.repository';
import { NO_ARTISTS_FOUND } from '../domain/codes/codes';
import { ArtistLocationRepository } from '../infrastructure/database/artistLocation.repository';
import { FindArtistByRangeDTORequest } from '../infrastructure/dtos/findArtistByRangeRequest.dto';
import {
  FindArtistByRangeResponseDTO,
  RawFindByArtistIdsResponseDTO,
} from '../infrastructure/dtos/findArtistByRangeResponse.dto';

@Injectable()
export class FindArtistByRangeUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly artistsLocationProvider: ArtistLocationRepository,
    private readonly artistProvider: ArtistRepository,
    private readonly reviewAvgProvider: ReviewAvgRepository,
    private readonly followingsProvider: FollowingsRepository,
  ) {
    super(FindArtistByRangeUseCase.name);
  }

  async execute(
    findArtistByArtistDTO: FindArtistByRangeDTORequest,
    customerId: string,
    userId: string,
  ): Promise<FindArtistByRangeResponseDTO[]> {
    console.log({ customerId });
    const origin: Point = {
      type: 'Point',
      coordinates: [findArtistByArtistDTO.lng, findArtistByArtistDTO.lat],
    };

    const locations = await this.artistsLocationProvider.findByRange(
      origin,
      findArtistByArtistDTO.range,
    );

    if (!locations.length) {
      throw new DomainNotFound(NO_ARTISTS_FOUND);
    }

    const artistIds = locations.map(location => location.artistId);

    const [artists, reviewsAvg, followersCount, userFollowArtist] =
      await Promise.all([
        this.artistProvider.rawFindByArtistIds(artistIds),
        this.reviewAvgProvider.findAvgByArtistIds(artistIds),
        this.followingsProvider.countFollowsByArtistIds(artistIds),
        this.followingsProvider.userFollowsArtists(userId, artistIds),
      ]);

    const artistByArtistId = new Map<string, RawFindByArtistIdsResponseDTO>(
      artists.map(artist => [artist.id, artist]),
    );

    const reviewsAvgByArtistId = new Map<string, ReviewAvgByArtistIdsResult>(
      reviewsAvg.map(reviewAvg => [reviewAvg.artistId, reviewAvg]),
    );

    locations.forEach(location => {
      location.artist = artistByArtistId.get(location.artistId);
      location.artist.review = reviewsAvgByArtistId.get(location.artistId);
      location.artist.followers = followersCount.get(location.artistId);
      location.artist.isFollowedByUser = userFollowArtist.get(
        location.artistId,
      );
    });
    return locations;
  }
}
