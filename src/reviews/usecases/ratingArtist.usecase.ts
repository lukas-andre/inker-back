import { Injectable } from '@nestjs/common';

import { AgendaProvider } from '../../agenda/infrastructure/providers/agenda.provider';
import { DomainUnProcessableEntity } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import {
  DefaultResponseDto,
  DefaultResponseStatus,
} from '../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../global/infrastructure/helpers/defaultResponse.helper';
import {
  EVENT_NEEDS_TO_BE_DONE_TO_RATE,
  USER_IS_NOT_RELATED_TO_EVENT,
} from '../../users/domain/errors/codes';
import { ERROR_CREATING_REVIEW } from '../codes';
import { ReviewProvider } from '../database/providers/review.provider';
import { ReviewArtistRequestDto } from '../dtos/reviewArtistRequest.dto';
import { queues } from '../../queues/queues';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  SyncArtistRatingsJobType,
  SyncJobIdSchema,
} from '../../queues/sync/jobs';

@Injectable()
export class RatingArtistUsecase extends BaseUseCase implements UseCase {
  constructor(
    private readonly reviewProvider: ReviewProvider,
    private readonly agendaProvider: AgendaProvider,
    @InjectQueue(queues.sync.name)
    private readonly syncQueue: Queue,
  ) {
    super(RatingArtistUsecase.name);
  }

  async execute(
    artistId: number,
    eventId: number,
    userId: number,
    body: ReviewArtistRequestDto,
  ): Promise<DefaultResponseDto> {
    const artistAgendaAndEventRelatedToCustomer =
      await this.agendaProvider.artistAgendaAndEventRelatedToCustomer(
        artistId,
        eventId,
        userId,
      );

    if (!artistAgendaAndEventRelatedToCustomer) {
      throw new DomainUnProcessableEntity(USER_IS_NOT_RELATED_TO_EVENT);
    }

    const isEventDone = artistAgendaAndEventRelatedToCustomer.eventIsDone;

    if (!isEventDone) {
      throw new DomainUnProcessableEntity(EVENT_NEEDS_TO_BE_DONE_TO_RATE);
    }

    if (this.isUserNotReviewIt(body)) {
      return this.emptyReviewFlow(artistId, eventId, userId, body);
    }

    const review =
      await this.reviewProvider.findIfCustomerAlreadyReviewTheEvent(
        userId,
        eventId,
        artistId,
      );

    let transactionIsOk = false;

    if (!review) {
      transactionIsOk = await this.reviewProvider.createReviewTransaction(
        artistId,
        eventId,
        userId,
        body,
      );
    } else {
      transactionIsOk = await this.reviewProvider.updateReviewTransaction(
        artistId,
        eventId,
        userId,
        body,
      );
    }

    if (!transactionIsOk) {
      throw new DomainUnProcessableEntity(ERROR_CREATING_REVIEW);
    }

    await this.dispatchSyncArtistRatingEvent(artistId);

    return {
      status: DefaultResponseStatus.CREATED,
      data: 'Artist rated successfully',
    };
  }
  async dispatchSyncArtistRatingEvent(artistId: number): Promise<void> {
    try {
      await this.syncQueue.add({
        jobId: SyncJobIdSchema.enum.SYNC_ARTIST_RATINGS,
        metadata: {
          artistId,
        } as SyncArtistRatingsJobType,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error syncing artist rating: ${error.message}`);
      } else {
        this.logger.error('Error syncing artist rating: Unknown error');
      }
    }
  }

  private isUserNotReviewIt(body: ReviewArtistRequestDto): boolean {
    // We need to check if the user is not making a review and just leave a rating
    return !body.comment && !body.rating;
  }

  private async emptyReviewFlow(
    artistId: number,
    eventId: number,
    userId: number,
    body: ReviewArtistRequestDto,
  ): Promise<DefaultResponseDto> {
    const customerReview =
      await this.reviewProvider.findIfCustomerAlreadyReviewTheEvent(
        userId,
        eventId,
        artistId,
      );

    if (customerReview && customerReview.isRated) {
      return DefaultResponse.ok;
    }

    await this.reviewProvider.insertEmptyReview(
      artistId,
      eventId,
      userId,
      body.displayName,
    );

    return { status: DefaultResponseStatus.CREATED, data: 'Review created' };
  }
}
