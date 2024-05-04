import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { AgendaProvider } from '../../agenda/infrastructure/providers/agenda.provider';
import {
  DomainBadRule,
  DomainNotFound,
  DomainUnProcessableEntity,
} from '../../global/domain/exceptions/domain.exception';
import { DefaultResponse } from '../../global/infrastructure/helpers/defaultResponse.helper';
import { ReviewReactionEnum } from '../../reactions/domain/enums/reviewReaction.enum';
import { ReviewProvider } from '../database/providers/review.provider';
import { ReviewReactionProvider } from '../database/providers/reviewReaction.provider';

import {
  ERROR_CREATING_REVIEW_REACTION,
  ERROR_DISABLING_REVIEW_REACTION,
  ERROR_UPDATING_REVIEW_REACTION,
  REVIEW_IS_PENDING_TO_RATE,
  REVIEW_NOT_FOUND,
  ReactToReviewUsecase,
} from './reactToReview.usecase';

describe('ReactToReviewUsecase', () => {
  let usecase: ReactToReviewUsecase;
  let reviewProvider: DeepMocked<ReviewProvider>;
  let reviewReactionProvider: DeepMocked<ReviewReactionProvider>;
  let agendaProvider: DeepMocked<AgendaProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReactToReviewUsecase,
        {
          provide: ReviewProvider,
          useValue: createMock<ReviewProvider>(),
        },
        {
          provide: AgendaProvider,
          useValue: createMock<AgendaProvider>(),
        },
        {
          provide: ReviewReactionProvider,
          useValue: createMock<ReviewReactionProvider>(),
        },
      ],
    }).compile();

    usecase = module.get<ReactToReviewUsecase>(ReactToReviewUsecase);
    reviewProvider = module.get(ReviewProvider);
    agendaProvider = module.get(AgendaProvider);
    reviewReactionProvider = module.get(ReviewReactionProvider);
  });

  it('ReactToReviewUsecase should be defined', () => {
    expect(usecase).toBeDefined();
  });

  it(`ReactToReviewUsecase[Review Don't Exists] should throw DomainNotFound(REVIEW_NOT_FOUND) if review doesn't exists`, async () => {
    const reviewId = 1;
    const userId = 1;
    const reaction = ReviewReactionEnum.like;

    reviewProvider.isReviewRated.mockResolvedValueOnce(undefined);

    try {
      await usecase.execute(reviewId, userId, reaction);
    } catch (error) {
      expect(error).toBeInstanceOf(DomainNotFound);
      expect((error as Error).message).toBe(REVIEW_NOT_FOUND);
    }
  });

  it(`ReactToReviewUsecase[Review Is Not Rated] should throw DomainBadRule(REVIEW_IS_PENDING_TO_RATE) if review is not rated`, async () => {
    const reviewId = 1;
    const userId = 1;
    const reaction = ReviewReactionEnum.like;

    reviewProvider.isReviewRated.mockResolvedValueOnce(false);

    try {
      await usecase.execute(reviewId, userId, reaction);
    } catch (error) {
      expect(error).toBeInstanceOf(DomainBadRule);
      expect((error as Error).message).toBe(REVIEW_IS_PENDING_TO_RATE);
    }
  });

  it(`ReactToReviewUsecase[Review Is Rated And Not Reacted Before] should insert the reaction `, async () => {
    const reviewId = 1;
    const userId = 1;
    const reaction = ReviewReactionEnum.like;

    reviewProvider.isReviewRated.mockResolvedValueOnce(true);
    reviewProvider.insertReviewReactionTransaction.mockResolvedValueOnce(true);
    reviewReactionProvider.getReviewReactionIfExists.mockResolvedValueOnce(
      undefined,
    );

    const result = await usecase.execute(reviewId, userId, reaction);

    expect(reviewProvider.insertReviewReactionTransaction).toBeCalledWith(
      reviewId,
      userId,
      reaction,
    );

    expect(result).toEqual(DefaultResponse.created);
  });

  it(`ReactToReviewUsecase[Review Is Rated And Not Reacted Before] should not insert the reaction if reviewProvider.insertReviewReactionTransaction fail `, async () => {
    const reviewId = 1;
    const userId = 1;
    const reaction = ReviewReactionEnum.like;

    reviewProvider.isReviewRated.mockResolvedValueOnce(true);
    reviewProvider.insertReviewReactionTransaction.mockResolvedValueOnce(false);
    reviewReactionProvider.getReviewReactionIfExists.mockResolvedValueOnce(
      undefined,
    );

    try {
      await usecase.execute(reviewId, userId, reaction);
    } catch (error) {
      expect(error).toBeInstanceOf(DomainUnProcessableEntity);
      expect((error as Error).message).toBe(ERROR_CREATING_REVIEW_REACTION);
    }

    expect(reviewProvider.insertReviewReactionTransaction).toBeCalledWith(
      reviewId,
      userId,
      reaction,
    );
  });

  it(`ReactToReviewUsecase[Review Is Rated And Reacted Before] should update the reaction `, async () => {
    const reviewId = 1;
    const userId = 1;
    const newReaction = ReviewReactionEnum.like;
    const currentReaction = ReviewReactionEnum.dislike;

    reviewProvider.isReviewRated.mockResolvedValueOnce(true);
    reviewProvider.updateReviewReactionTransaction.mockResolvedValueOnce(true);
    reviewReactionProvider.getReviewReactionIfExists.mockResolvedValueOnce(
      currentReaction,
    );

    const result = await usecase.execute(reviewId, userId, newReaction);

    expect(reviewProvider.updateReviewReactionTransaction).toBeCalledWith(
      currentReaction,
      reviewId,
      userId,
      newReaction,
    );

    expect(result).toEqual(DefaultResponse.created);
  });

  it(`ReactToReviewUsecase[Review Is Rated And Reacted Before] should not update the reaction if reviewProvider.updateReviewReactionTransaction fail `, async () => {
    const reviewId = 1;
    const userId = 1;
    const newReaction = ReviewReactionEnum.like;
    const currentReaction = ReviewReactionEnum.dislike;

    reviewProvider.isReviewRated.mockResolvedValueOnce(true);
    reviewProvider.updateReviewReactionTransaction.mockResolvedValueOnce(false);
    reviewReactionProvider.getReviewReactionIfExists.mockResolvedValueOnce(
      currentReaction,
    );

    try {
      await usecase.execute(reviewId, userId, newReaction);
    } catch (error) {
      expect(error).toBeInstanceOf(DomainUnProcessableEntity);
      expect((error as Error).message).toBe(ERROR_UPDATING_REVIEW_REACTION);
    }

    expect(reviewProvider.updateReviewReactionTransaction).toBeCalledWith(
      currentReaction,
      reviewId,
      userId,
      newReaction,
    );
  });

  it(`ReactToReviewUsecase[Review Is Rated And Reacted Before] should disable the reaction if newReaction is the same as currentReaction`, async () => {
    const reviewId = 1;
    const userId = 1;
    const newReaction = ReviewReactionEnum.like;
    const currentReaction = ReviewReactionEnum.like;

    reviewProvider.isReviewRated.mockResolvedValueOnce(true);
    reviewProvider.offReviewReactionTransaction.mockResolvedValueOnce(true);
    reviewReactionProvider.getReviewReactionIfExists.mockResolvedValueOnce(
      currentReaction,
    );

    const result = await usecase.execute(reviewId, userId, newReaction);

    expect(reviewProvider.offReviewReactionTransaction).toBeCalledWith(
      currentReaction,
      reviewId,
      userId,
    );

    expect(result).toEqual(DefaultResponse.created);
  });

  it(`ReactToReviewUsecase[Review Is Rated And Reacted Before] should disable the reaction if newReaction is off`, async () => {
    const reviewId = 1;
    const userId = 1;
    const newReaction = ReviewReactionEnum.off;
    const currentReaction = ReviewReactionEnum.like;

    reviewProvider.isReviewRated.mockResolvedValueOnce(true);
    reviewProvider.offReviewReactionTransaction.mockResolvedValueOnce(true);
    reviewReactionProvider.getReviewReactionIfExists.mockResolvedValueOnce(
      currentReaction,
    );

    const result = await usecase.execute(reviewId, userId, newReaction);

    expect(reviewProvider.offReviewReactionTransaction).toBeCalledWith(
      currentReaction,
      reviewId,
      userId,
    );

    expect(result).toEqual(DefaultResponse.created);
  });

  it(`ReactToReviewUsecase[Review Is Rated And Reacted Before] should throw error if reviewProvider.offReviewReactionTransaction fail`, async () => {
    const reviewId = 1;
    const userId = 1;
    const newReaction = ReviewReactionEnum.off;
    const currentReaction = ReviewReactionEnum.like;

    reviewProvider.isReviewRated.mockResolvedValueOnce(true);
    reviewProvider.offReviewReactionTransaction.mockResolvedValueOnce(false);
    reviewReactionProvider.getReviewReactionIfExists.mockResolvedValueOnce(
      currentReaction,
    );

    try {
      await usecase.execute(reviewId, userId, newReaction);
    } catch (error) {
      expect(error).toBeInstanceOf(DomainUnProcessableEntity);
      expect((error as Error).message).toBe(ERROR_DISABLING_REVIEW_REACTION);
    }

    expect(reviewProvider.offReviewReactionTransaction).toBeCalledWith(
      currentReaction,
      reviewId,
      userId,
    );
  });
});
