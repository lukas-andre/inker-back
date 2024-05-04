import { Injectable } from '@nestjs/common';

import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { Review } from '../../reviews/database/entities/review.entity';
import { ReviewProvider } from '../../reviews/database/providers/review.provider';
import {
  CustomerReviewReactionDetailsResult,
  ReviewReactionProvider,
} from '../../reviews/database/providers/reviewReaction.provider';
import { GetWorkEvidenceByArtistIdResponseDto } from '../infrastructure/dtos/getWorkEvidenceByArtistIdResponse.dto';
import { AgendaProvider } from '../infrastructure/providers/agenda.provider';
import { AgendaEventProvider } from '../infrastructure/providers/agendaEvent.provider';

@Injectable()
export class GetWorkEvidenceByArtistIdUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(
    private readonly agendaProvider: AgendaProvider,
    private readonly agendaEventProvider: AgendaEventProvider,
    private readonly reviewReactionProvider: ReviewReactionProvider,
    private readonly reviewProvider: ReviewProvider,
  ) {
    super(GetWorkEvidenceByArtistIdUseCase.name);
  }

  async execute(
    artistId: number,
    page: number,
    limit: number,
    customerId: number,
  ): Promise<GetWorkEvidenceByArtistIdResponseDto> {
    const agendaEvents = await this.agendaEventProvider.paginate(
      artistId,
      page,
      limit,
    );

    const eventsIds = agendaEvents.items.map(event => event.id);

    const reviews = await this.reviewProvider.findByEventIds(eventsIds);

    const reviewsByEventIdMap = new Map<number, Review>();

    const reviewsIds = [];
    reviews.forEach(review => {
      if (!reviewsByEventIdMap.get(review.eventId)) {
        reviewsByEventIdMap.set(review.eventId, review);
      }
      reviewsIds.push(review.id);
    });

    const customerReviewsDetails =
      await this.reviewReactionProvider.findCustomerReviewsReactionDetail(
        customerId,
        reviewsIds,
      );

    const events = agendaEvents.items.map(event => {
      const review: Review & {
        customerReviewDetail?: CustomerReviewReactionDetailsResult;
      } = reviewsByEventIdMap.get(event.id);

      if (review) {
        const customerReviewDetail = customerReviewsDetails.get(review.id);

        if (customerReviewDetail) {
          review.customerReviewDetail = customerReviewDetail;
        }
      }
      return {
        ...event,
        review,
      };
    });

    return {
      ...agendaEvents,
      items: events,
    };
  }
}
