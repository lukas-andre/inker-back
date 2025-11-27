import { Injectable } from '@nestjs/common';

import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { Review } from '../../reviews/database/entities/review.entity';
import { ReviewRepository } from '../../reviews/database/repositories/review.repository';
import { CustomerReviewReactionDetailsResult } from '../../reviews/interfaces/reviewReaction.interface';
import { GetWorkEvidenceByArtistIdResponseDto } from '../infrastructure/dtos/getWorkEvidenceByArtistIdResponse.dto';
import { AgendaRepository } from '../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../infrastructure/repositories/agendaEvent.repository';

@Injectable()
export class GetWorkEvidenceByArtistIdUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(
    private readonly agendaProvider: AgendaRepository,
    private readonly agendaEventProvider: AgendaEventRepository,
    private readonly reviewProvider: ReviewRepository,
  ) {
    super(GetWorkEvidenceByArtistIdUseCase.name);
  }

  async execute(
    artistId: string,
    page: number,
    limit: number,
    customerId: string,
  ): Promise<GetWorkEvidenceByArtistIdResponseDto> {
    const agendaEvents = await this.agendaEventProvider.paginate(
      artistId,
      page,
      limit,
    );

    const eventsIds = agendaEvents.items.map(event => event.id);

    const reviews = await this.reviewProvider.findByEventIds(eventsIds);

    const reviewsByEventIdMap = new Map<string, Review>();

    const reviewsIds = [];
    reviews.forEach(review => {
      if (!reviewsByEventIdMap.get(review.eventId)) {
        reviewsByEventIdMap.set(review.eventId, review);
      }
      reviewsIds.push(review.id);
    });

    const customerReviewsDetails =
      await this.reviewProvider.findCustomerReviewsReactionDetail(
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
