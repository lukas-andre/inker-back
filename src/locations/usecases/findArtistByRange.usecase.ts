import { Injectable } from '@nestjs/common';
import { Point } from 'geojson';

import {
  AgendaProvider,
  FindRecentWorksByArtistIdsResult,
} from '../../agenda/infrastructure/providers/agenda.provider';
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
import { ReviewReactionProvider } from '../../reviews/database/providers/reviewReaction.provider';
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
    private readonly reviewProvider: ReviewProvider,
    private readonly reviewReactionProvider: ReviewReactionProvider,
    private readonly reviewAvgProvider: ReviewAvgProvider,
    private readonly agendaProvider: AgendaProvider,
  ) {
    super(FindArtistByRangeUseCase.name);
  }

  async execute(
    findArtistByArtistDTO: FindArtistByRangeDTORequest,
    customerId: number,
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

    const artistIds = [];
    for (let i = 0; i < locations.length; i++) {
      artistIds.push(locations[i].artistId);
    }

    const [artists, reviews, reviewsAvg, recentWorks] = await Promise.all([
      this.artistProvider.rawFindByArtistIds(artistIds),
      this.reviewProvider.findByArtistIds(artistIds),
      this.reviewAvgProvider.findAvgByArtistIds(artistIds),
      this.agendaProvider.findRecentWorksByArtistIds(artistIds),
    ]);

    const artistByArtistId = new Map<number, RawFindByArtistIdsResponseDTO>();
    const reviewsByArtistId = new Map<number, FindByArtistIdsResult[]>();
    const reviewsAvgByArtistId = new Map<number, ReviewAvgByArtistIdsResult>();
    const recentWorksByArtistId = new Map<
      number,
      FindRecentWorksByArtistIdsResult[]
    >();

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

    const reviewsIds = [];
    for (let i = 0; i < reviews.length; i++) {
      reviewsIds.push(reviews[i].id);
    }

    const customerReviewsDetails =
      await this.reviewReactionProvider.findCustomerReviewsDetails(
        customerId,
        reviewsIds,
      );

    for (let i = 0; i < recentWorks.length; i++) {
      if (!recentWorksByArtistId.get(recentWorks[i].artistId)) {
        recentWorksByArtistId.set(recentWorks[i].artistId, [recentWorks[i]]);
      } else {
        const recentWorksById = recentWorksByArtistId.get(
          recentWorks[i].artistId,
        );
        recentWorksById.push(recentWorks[i]);
        recentWorksByArtistId.set(recentWorks[i].artistId, recentWorksById);
      }
    }

    for (let i = 0; i < reviews.length; i++) {
      if (!reviewsByArtistId.get(reviews[i].artistId)) {
        const review = reviews[i];

        review.customerReactionDetail = customerReviewsDetails.get(review.id);

        reviewsByArtistId.set(reviews[i].artistId, [review]);
      } else {
        const reviewsById = reviewsByArtistId.get(reviews[i].artistId);
        const review = reviews[i];

        review.customerReactionDetail = customerReviewsDetails.get(review.id);

        reviewsById.push(review);
        reviewsByArtistId.set(reviews[i].artistId, reviewsById);
      }
    }

    locations.forEach(location => {
      location.artist = artistByArtistId.get(location.artistId);
      location.artist.reviews = reviewsByArtistId.get(location.artistId);
      location.artist.review = reviewsAvgByArtistId.get(location.artistId);
      location.artist.recentWorks = recentWorksByArtistId.get(
        location.artistId,
      );
    });
    return locations;
  }
}
