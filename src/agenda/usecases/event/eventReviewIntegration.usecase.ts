import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

// import { RatingArtistUsecase } from '../../../reviews/usecases/ratingArtist.usecase'; // Removed
import { ReviewRepository } from '../../../reviews/database/repositories/review.repository'; // Added
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository'; // Added
import { queues } from '../../../queues/queues'; // Added
import {
  SyncArtistRatingsJobType,
  SyncJobIdSchema,
} from '../../../queues/sync/jobs'; // Added
import { BaseUseCase, UseCase } from '../../../global/domain/usecases/base.usecase';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { DomainUnProcessableEntity, DomainForbidden, DomainNotFound } from '../../../global/domain/exceptions/domain.exception';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import { CUSTOMER_NOT_AUTHORIZED, EVENT_NOT_READY_FOR_REVIEW } from '../../domain/errors/codes';
import { ReviewArtistRequestDto } from '../../../reviews/dtos/reviewArtistRequest.dto';
import { DefaultResponseDto, DefaultResponseStatus } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { EventStateMachineService, StateMachineContext, AgendaEventTransition } from '../../domain/services/eventStateMachine.service';
// import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity'; // Removed as not directly used, event comes from context
import { UserType } from '../../../users/domain/enums/userType.enum';
import {
  EVENT_NEEDS_TO_BE_DONE_TO_RATE, // Added
  USER_IS_NOT_RELATED_TO_EVENT, // Added
} from '../../../users/domain/errors/codes'; // Added
import { ERROR_CREATING_REVIEW } from '../../../reviews/codes'; // Added
// import { DefaultResponse } from '../../../global/infrastructure/helpers/defaultResponse.helper'; // Removed, not used for this flow

// Temporary structural type for actor if IActor is not yet exported from its module
interface ActorForReview {
    userId: string;
    roleId: string;
    role: UserType;
}

@Injectable()
export class EventReviewIntegrationUsecase extends BaseUseCase implements UseCase {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly agendaEventProvider: AgendaEventRepository,
    // private readonly ratingArtistUsecase: RatingArtistUsecase, // Removed
    private readonly reviewRepository: ReviewRepository, // Added
    private readonly agendaRepository: AgendaRepository, // Added
    @InjectQueue(queues.sync.name) private readonly syncQueue: Queue, // Added
    private readonly eventStateMachineService: EventStateMachineService,
  ) {
    super(EventReviewIntegrationUsecase.name);
  }

  async execute(
    agendaId: string,
    eventId: string,
    reviewData: ReviewArtistRequestDto,
  ): Promise<DefaultResponseDto> {
    const { userId, userTypeId, isNotCustomer } = this.requestContext;

    if (isNotCustomer) {
      throw new DomainForbidden(CUSTOMER_NOT_AUTHORIZED);
    }
    const customerId = userTypeId; // Assuming userTypeId is the customerId for a customer

    const event = await this.agendaEventProvider.findOne({
      where: { id: eventId, agenda: { id: agendaId }, customerId: customerId },
      relations: ['agenda'],
    });

    if (!event) {
      throw new DomainNotFound('Event not found or not associated with this customer for the given agenda.');
    }

    if (![AgendaEventStatus.WAITING_FOR_REVIEW, AgendaEventStatus.COMPLETED, AgendaEventStatus.WAITING_FOR_PHOTOS].includes(event.status)) {
      throw new DomainUnProcessableEntity(EVENT_NOT_READY_FOR_REVIEW);
    }

    const artistId = event.agenda.artistId;

    // --- Logic from RatingArtistUsecase starts here ---
    const artistAgendaAndEventRelatedToCustomer =
      await this.agendaRepository.artistAgendaAndEventRelatedToCustomer(
        artistId,
        eventId,
        customerId, // customerId here is the reviewerId
      );

    if (!artistAgendaAndEventRelatedToCustomer) {
      throw new DomainUnProcessableEntity(USER_IS_NOT_RELATED_TO_EVENT);
    }

    // In the context of EventReviewIntegration, the event status check (WAITING_FOR_REVIEW)
    // implicitly means the event is done or at a stage where review is expected.
    // The original `RatingArtistUsecase` had an `isEventDone` check.
    // We'll rely on the `WAITING_FOR_REVIEW` status for this use case.
    // If a more explicit `isEventDone` check is needed from `artistAgendaAndEventRelatedToCustomer.eventIsDone`
    // it can be added here. For now, we proceed based on `AgendaEventStatus.WAITING_FOR_REVIEW`.

    if (this.isUserNotSubmittingReview(reviewData)) {
      // Handle empty review flow (user might be clearing a previous rating/comment)
      const customerReview =
        await this.reviewRepository.findIfCustomerAlreadyReviewTheEvent(
          userId, // reviewerId
          eventId,
          artistId,
        );

      // If there's an existing review and the user is submitting an empty form,
      // it implies they want to remove their rating/comment.
      // The original RatingArtistUsecase created an "empty review" record if one didn't exist
      // and the current submission was empty.
      // For this integrated flow, if it's an empty submission and a review exists,
      // we can consider updating it to an empty state or deleting it.
      // Or, as in the original, if no review exists and it's an "empty submission"
      // we might create a minimal review record.
      // For now, let's align with creating/updating based on reviewData.
      // If reviewData is empty and review exists, it will be updated to empty.
      // If reviewData is empty and no review exists, it will create an empty review.

      if (customerReview) {
        // If they are submitting an empty form and a review exists, update it.
         await this.reviewRepository.updateReviewTransaction(
          artistId,
          eventId,
          userId,
          reviewData, // this will be empty (no rating, no comment)
        );
      } else {
        // If submitting empty form and no review exists, create an empty one.
        await this.reviewRepository.insertEmptyReview(
          artistId,
          eventId,
          userId,
          reviewData.displayName,
        );
      }
      // After handling empty/cleared review, dispatch sync and proceed to state machine.
    } else {
      // User is submitting a review with rating or comment
      const existingReview =
        await this.reviewRepository.findIfCustomerAlreadyReviewTheEvent(
          userId, // reviewerId
          eventId,
          artistId,
        );

      let transactionIsOk = false;
      if (!existingReview) {
        transactionIsOk = await this.reviewRepository.createReviewTransaction(
          artistId,
          eventId,
          userId, // reviewerId
          reviewData,
        );
      } else {
        transactionIsOk = await this.reviewRepository.updateReviewTransaction(
          artistId,
          eventId,
          userId, // reviewerId
          reviewData,
        );
      }

      if (!transactionIsOk) {
        throw new DomainUnProcessableEntity(ERROR_CREATING_REVIEW);
      }
    }

    await this.dispatchSyncArtistRatingEvent(artistId);
    // --- Logic from RatingArtistUsecase ends here ---


    // The original ratingArtistUsecase returned a simple string message.
    // We need to ensure we have the review ID if possible for the state machine payload.
    // Let's try to fetch the review again after creation/update to get its ID.
    const finalReview = await this.reviewRepository.findIfCustomerAlreadyReviewTheEvent(
        userId, // reviewerId
        eventId,
        artistId
    );

    let reviewIdForPayload: string | undefined = finalReview?.id;

    if (!reviewIdForPayload) {
        this.logger.warn(`Review ID could not be determined for event ${eventId}, artist ${artistId} by user ${userId}. Proceeding with state transition.`);
    }


    const actor: ActorForReview = {
        userId: userId,
        roleId: customerId, // customer's type-specific ID
        role: UserType.CUSTOMER,
    };

    const stateMachineContext: StateMachineContext = {
        eventEntity: event,
        actor,
        payload: {
            reviewId: reviewIdForPayload,
            notes: `Review added/updated by customer ${userId}.`
        },
    };

    await this.eventStateMachineService.transition(
      event.status,
      AgendaEventTransition.ADD_REVIEW,
      stateMachineContext,
    );

    return {
      status: DefaultResponseStatus.OK,
      data: 'Event reviewed successfully and status updated.',
    };
  }

  private async dispatchSyncArtistRatingEvent(artistId: string): Promise<void> {
    try {
      await this.syncQueue.add({
        jobId: SyncJobIdSchema.enum.SYNC_ARTIST_RATINGS,
        metadata: {
          artistId,
        } as SyncArtistRatingsJobType,
      });
      this.logger.log(`Dispatched SYNC_ARTIST_RATINGS job for artist ${artistId}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error dispatching SYNC_ARTIST_RATINGS job for artist ${artistId}: ${error.message}`);
      } else {
        this.logger.error(`Error dispatching SYNC_ARTIST_RATINGS job for artist ${artistId}: Unknown error`);
      }
    }
  }

  private isUserNotSubmittingReview(body: ReviewArtistRequestDto): boolean {
    // We need to check if the user is not making a review (no comment and no rating)
    return !body.comment && !body.rating;
  }
}