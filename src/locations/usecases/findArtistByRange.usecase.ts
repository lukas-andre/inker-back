import { Injectable } from '@nestjs/common';
import { Point } from 'geojson';

import { ArtistProvider } from '../../artists/infrastructure/database/artist.provider';
import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import {
  FindByArtistIdsResult,
  ReviewProvider,
} from '../../reviews/database/providers/review.provider';
import {
  ReviewAvgByArtistIdsResult,
  ReviewAvgProvider,
} from '../../reviews/database/providers/reviewAvg.provider';
import { NO_ARTISTS_FOUND } from '../domain/codes/codes';
import { ArtistLocationsDbService } from '../infrastructure/database/services/artistLocationsDb.service';
import { FindArtistByArtistDTORequest } from '../infrastructure/dtos/findArtistByRangeRequest.dto';
import {
  FindArtistByRangeResponseDTO,
  RawFindByArtistIdsResponseDTO,
} from '../infrastructure/dtos/findArtistByRangeResponse.dto';

@Injectable()
export class FindArtistByRangeUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly artistsLocationDbService: ArtistLocationsDbService,
    private readonly artistsDbService: ArtistProvider,
    private readonly reviewProvider: ReviewProvider,
    private readonly reviewAvgProvider: ReviewAvgProvider,
  ) {
    super(FindArtistByRangeUseCase.name);
  }

  async execute(
    findArtistByArtistDTO: FindArtistByArtistDTORequest,
  ): Promise<FindArtistByRangeResponseDTO[]> {
    const origin: Point = {
      type: 'Point',
      coordinates: [findArtistByArtistDTO.lng, findArtistByArtistDTO.lat],
    };

    const locations = await this.artistsLocationDbService.findByRange(
      origin,
      findArtistByArtistDTO.range,
    );

    if (!locations.length) {
      throw new DomainNotFound(NO_ARTISTS_FOUND);
    }

    const artistIds = [];
    for (let i = 0; i < locations.length; i++) {
      artistIds.push(locations[i].artistId);
    }

    const artists = await this.artistsDbService.rawFindByArtistIds(artistIds);
    const reviews = await this.reviewProvider.findByArtistIds(artistIds);
    const reviewsAvg = await this.reviewAvgProvider.findAvgByArtistIds(
      artistIds,
    );

    const artistByArtistId = new Map<number, RawFindByArtistIdsResponseDTO>();
    const reviewsByArtistId = new Map<number, FindByArtistIdsResult[]>();
    const reviewsAvgByArtistId = new Map<number, ReviewAvgByArtistIdsResult>();

    for (let i = 0; i < artists.length; i++) {
      if (!artistByArtistId.get(artists[i].id)) {
        artistByArtistId.set(artists[i].id, artists[i]);
      }
    }

    for (let i = 0; i < reviewsAvg.length; i++) {
      if (!reviewsAvgByArtistId.get(reviewsAvg[i].artistId)) {
        reviewsAvgByArtistId.set(reviewsAvg[i].artistId, reviewsAvg[i]);
      }
    }

    for (let i = 0; i < reviews.length; i++) {
      if (!reviewsByArtistId.get(reviews[i].artistId)) {
        reviewsByArtistId.set(reviews[i].artistId, [reviews[i]]);
      } else {
        const reviewsById = reviewsByArtistId.get(reviews[i].artistId);
        reviewsById.push(reviews[i]);
        reviewsByArtistId.set(reviews[i].artistId, reviewsById);
      }
    }

    locations.forEach(location => {
      location.artist = artistByArtistId.get(location.artistId);
      location.artist.reviews = reviewsByArtistId.get(location.artistId);
      location.artist.review = reviewsAvgByArtistId.get(location.artistId);
    });
    return locations;
  }
}
