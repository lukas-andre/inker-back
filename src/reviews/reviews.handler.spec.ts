import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing/test';
import { TestingModule } from '@nestjs/testing/testing-module';
import { ModuleMocker } from 'jest-mock';

import { RequestService } from '../global/infrastructure/services/requestContext.service';
import { ReviewReactionEnum } from '../reactions/domain/enums/reviewReaction.enum';

import { ReviewProvider } from './database/providers/review.provider';
import { ReviewArtistRequestDto } from './dtos/reviewArtistRequest.dto';
import { ReviewHandler } from './reviews.handler';
import { GetReviewsFromArtistUsecase } from './usecases/getReviewsFromArtist.usecase';
import { RatingArtistUsecase } from './usecases/ratingArtist.usecase';
import { ReactToReviewUsecase } from './usecases/reactToReview.usecase';

const moduleMocker = new ModuleMocker(global);
describe('ReviewHandler', () => {
  let handler: ReviewHandler;
  let ratingArtistUseCase: DeepMocked<RatingArtistUsecase>;
  let reactToReviewUseCase: DeepMocked<ReactToReviewUsecase>;
  let getReviewsFromArtistUsecase: DeepMocked<GetReviewsFromArtistUsecase>;
  let requestService: DeepMocked<RequestService>;
  let jwtService: DeepMocked<JwtService>;
  let reviewProvider: DeepMocked<ReviewProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewHandler,
        {
          provide: RatingArtistUsecase,
          useValue: createMock<RatingArtistUsecase>(),
        },
        {
          provide: ReactToReviewUsecase,
          useValue: createMock<ReactToReviewUsecase>(),
        },
        {
          provide: GetReviewsFromArtistUsecase,
          useValue: createMock<GetReviewsFromArtistUsecase>(),
        },
        {
          provide: RequestService,
          useValue: createMock<RequestService>(),
        },
        {
          provide: ReviewProvider,
          useValue: createMock<ReviewProvider>(),
        },
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
      ],
    }).compile();

    handler = module.get<ReviewHandler>(ReviewHandler);
    ratingArtistUseCase = module.get(RatingArtistUsecase);
    reactToReviewUseCase = module.get(ReactToReviewUsecase);
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
