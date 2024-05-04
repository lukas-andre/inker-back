import { Injectable } from '@nestjs/common';
import { Point } from 'geojson';

import { ArtistProvider } from '../../artists/infrastructure/database/artist.provider';
import { FollowingsProvider } from '../../follows/infrastructure/database/followings.provider';
import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import {
  ReviewAvgByArtistIdsResult,
  ReviewAvgProvider,
} from '../../reviews/database/providers/reviewAvg.provider';
import { NO_ARTISTS_FOUND } from '../domain/codes/codes';
import { ArtistLocationProvider } from '../infrastructure/database/artistLocation.provider';
import { FindArtistByRangeDTORequest } from '../infrastructure/dtos/findArtistByRangeRequest.dto';
import {
  FindArtistByRangeResponseDTO,
  RawFindByArtistIdsResponseDTO,
} from '../infrastructure/dtos/findArtistByRangeResponse.dto';

@Injectable()
export class FindArtistByRangeUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly artistsLocationProvider: ArtistLocationProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly reviewAvgProvider: ReviewAvgProvider,
    private readonly followingsProvider: FollowingsProvider,
  ) {
    super(FindArtistByRangeUseCase.name);
  }

  async execute(
    findArtistByArtistDTO: FindArtistByRangeDTORequest,
    customerId: number,
    userId: number,
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

    const artistByArtistId = new Map<number, RawFindByArtistIdsResponseDTO>(
      artists.map(artist => [artist.id, artist]),
    );

    const reviewsAvgByArtistId = new Map<number, ReviewAvgByArtistIdsResult>(
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
