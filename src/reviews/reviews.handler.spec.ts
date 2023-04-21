import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing/test';
import { TestingModule } from '@nestjs/testing/testing-module';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

import { DefaultResponse } from '../global/infrastructure/helpers/defaultResponse.helper';
import { ReviewReactionEnum } from '../reactions/domain/enums/reviewReaction.enum';

import { ReviewProvider } from './database/providers/review.provider';
import { ReviewArtistRequestDto } from './dtos/reviewArtistRequest.dto';
import { ReviewHandler } from './reviews.handler';
import { RatingArtistUsecase } from './usecases/ratingArtist.usecase';
import { ReactToReviewUsecase } from './usecases/reactToReview.usecase';

const moduleMocker = new ModuleMocker(global);
describe('ReviewHandler', () => {
  let handler: ReviewHandler;
  let ratingArtistUseCase: RatingArtistUsecase;
  let reactToReviewUseCase: ReactToReviewUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewHandler],
    })
      .useMocker(token => {
        if (token === RatingArtistUsecase) {
          return {
            execute: jest.fn(() => DefaultResponse.ok),
          };
        }

        if (token === ReactToReviewUsecase) {
          return {
            execute: jest.fn(),
          };
        }

        if (token === JwtService) {
          return jest.fn();
        }

        if (token === ReviewProvider) {
          return {
            repo: jest.fn(),
          };
        }

        if (token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;

          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    handler = module.get<ReviewHandler>(ReviewHandler);
    ratingArtistUseCase = module.get<RatingArtistUsecase>(RatingArtistUsecase);
    reactToReviewUseCase =
      module.get<ReactToReviewUsecase>(ReactToReviewUsecase);
  });

  it('ReviewHandler should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('ReviewHandler.reviewArtist should call ratingArtistUseCase.execute', async () => {
    const artistId = 1;
    const eventId = 1;
    const userId = 1;
    const body: ReviewArtistRequestDto = {
      rating: 5,
      comment: 'comment',
      displayName: 'displayName',
    };

    await handler.reviewArtist(artistId, eventId, userId, body);

    expect(ratingArtistUseCase.execute).toBeCalledWith(
      artistId,
      eventId,
      userId,
      body,
    );

    expect(ratingArtistUseCase.execute).toBeCalledTimes(1);
  });

  it('ReviewHandler.reactToReview should call reactToReviewUseCase.execute', async () => {
    const reviewId = 1;
    const userId = 1;
    const reaction = ReviewReactionEnum.like;

    await handler.reactToReview(reviewId, userId, reaction);

    expect(reactToReviewUseCase.execute).toBeCalledWith(
      reviewId,
      userId,
      reaction,
    );

    expect(reactToReviewUseCase.execute).toBeCalledTimes(1);
  });

  // it('ReviewHandler.getReviewByArtistId should call getReviewsFromArtist.execute', async () => {
  //   const reviewId = 1;
  //   const artistId = 1;
  //   const page = 1;
  //   const limit = 10;

  //   await handler.getReviewFromArtist(reviewId, artistId, page, limit);

  //   expect(ratingArtistUseCase.getReviewsFromArtist).toBeCalledWith(artistId);

  //   expect(ratingArtistUseCase.getReviewsFromArtist).toBeCalledTimes(1);
  // });
});
