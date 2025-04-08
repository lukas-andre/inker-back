import { Injectable } from '@nestjs/common';

import {
  DomainBadRule,
  DomainNotFound,
  DomainUnProcessableEntity,
} from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { DefaultResponseDto } from '../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../global/infrastructure/helpers/defaultResponse.helper';
import { ReviewRepository } from '../database/repositories/review.repository';
import { ReviewReactionEnum } from '../reviews.controller';

export const REVIEW_IS_PENDING_TO_RATE = 'Review is pending to rate';
export const REVIEW_NOT_FOUND = 'Review not found';
export const ERROR_UPDATING_REVIEW_REACTION = 'Error updating review reaction';
export const ERROR_CREATING_REVIEW_REACTION = 'Error creating review reaction';
export const ERROR_DISABLING_REVIEW_REACTION =
  'Error disabling review reaction';

@Injectable()
export class ReactToReviewUsecase extends BaseUseCase implements UseCase {
  constructor(
    private readonly reviewProvider: ReviewRepository,
  ) {
    super(ReactToReviewUsecase.name);
  }

  async execute(
    reviewId: string,
    customerId: string,
    reaction: ReviewReactionEnum,
  ): Promise<DefaultResponseDto> {
    const isRated = await this.reviewProvider.isReviewRated(reviewId);

    if (isRated === undefined) {
      throw new DomainNotFound(REVIEW_NOT_FOUND);
    }

    if (!isRated) {
      throw new DomainBadRule(REVIEW_IS_PENDING_TO_RATE);
    }

    const currentReviewReaction =
      await this.reviewProvider.getReviewReactionIfExists(
        reviewId,
        customerId,
      );

    if (
      currentReviewReaction === ReviewReactionEnum.off &&
      reaction === ReviewReactionEnum.off
    ) {
      return DefaultResponse.created;
    }

    if (
      !this.reactionIsOff(reaction) &&
      this.customerNotReactedToReviewBefore(currentReviewReaction)
    ) {
      return this.reactToReviewForTheFirstTime(reviewId, customerId, reaction);
    }

    if (
      this.reactionIsOff(reaction) ||
      this.reactionIsTheSame(currentReviewReaction, reaction)
    ) {
      return this.offReaction(currentReviewReaction, reviewId, customerId);
    }

    return this.updateReviewReaction(
      currentReviewReaction,
      reviewId,
      customerId,
      reaction,
    );
  }

  private reactionIsTheSame(
    reviewReaction: ReviewReactionEnum,
    reaction: ReviewReactionEnum,
  ) {
    return reviewReaction === reaction;
  }

  private reactionIsOff(reaction: ReviewReactionEnum) {
    return reaction === ReviewReactionEnum.off;
  }

  private async updateReviewReaction(
    currentReaction: ReviewReactionEnum,
    reviewId: string,
    customerId: string,
    reaction: ReviewReactionEnum,
  ) {
    const result = await this.reviewProvider.updateReviewReactionTransaction(
      currentReaction,
      reviewId,
      customerId,
      reaction,
    );

    if (!result) {
      throw new DomainUnProcessableEntity(ERROR_UPDATING_REVIEW_REACTION);
    }

    return DefaultResponse.created;
  }

  private async offReaction(
    currentReaction: ReviewReactionEnum,
    reviewId: string,
    customerId: string,
  ) {
    const result = await this.reviewProvider.offReviewReactionTransaction(
      currentReaction,
      reviewId,
      customerId,
    );

    if (!result) {
      throw new DomainUnProcessableEntity(ERROR_DISABLING_REVIEW_REACTION);
    }

    return DefaultResponse.created;
  }

  private async reactToReviewForTheFirstTime(
    reviewId: string,
    customerId: string,
    reaction: ReviewReactionEnum,
  ) {
    const result = await this.reviewProvider.insertReviewReactionTransaction(
      reviewId,
      customerId,
      reaction,
    );

    if (!result) {
      throw new DomainUnProcessableEntity(ERROR_CREATING_REVIEW_REACTION);
    }

    return DefaultResponse.created;
  }

  private customerNotReactedToReviewBefore(reviewReaction: ReviewReactionEnum) {
    return reviewReaction === undefined;
  }
}
