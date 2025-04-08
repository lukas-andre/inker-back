import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { REVIEW_DB_CONNECTION_NAME } from '../../../../databases/constants';
import { always } from '../../../../global/domain/utils/always';
import { ReviewReactionEnum } from '../../../../reactions/domain/enums/reviewReaction.enum';
import { Review } from '../../entities/review.entity';
import { ReviewAvg } from '../../entities/reviewAvg.entity';
import { ReviewReaction } from '../../entities/reviewReaction.entity';

import {
  CustomerReviewReactionDetailsResult,
  ReviewReactionRepository,
} from '../reviewReaction.repository';

describe('ReviewReactionProvider', () => {
  const reviewReactionToken = getRepositoryToken(ReviewReaction);
  const entities = [Review, ReviewAvg, ReviewReaction];
  let reviewReactionProvider: ReviewReactionRepository;
  let moduleFixture: TestingModule;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: 'inker-test',
          host: process.env.DB_HOST || '0.0.0.0',
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || 'root',
          port: parseInt(process.env.DB_PORT, 10),
          name: 'review-db',
          entities: entities,
          synchronize: true,
          // dropSchema: true,
          logging: true,
          // keepConnectionAlive: true,
        }),
        TypeOrmModule.forFeature(entities, REVIEW_DB_CONNECTION_NAME),
      ],
      providers: [
        {
          provide: reviewReactionToken,
          useClass: Repository,
        },
        ReviewReactionRepository,
      ],
    }).compile();

    reviewReactionProvider = moduleFixture.get<ReviewReactionRepository>(
      ReviewReactionRepository,
    );
  });

  afterAll(async () => {
    await reviewReactionProvider.repo.query('TRUNCATE TABLE review');
    await moduleFixture.close();
  });

  it('reviewProvider should be defined', async () => {
    expect(reviewReactionProvider).toBeDefined();
  });

  it('reviewProvider.repo should be defined as Repository', async () => {
    expect(reviewReactionProvider.repo).toBeDefined();
    expect(reviewReactionProvider.repo).toBeInstanceOf(Repository);
  });

  it('reviewProvider.getReviewReactionIfExists should return reviewReaction if review exists', async () => {
    const [reviewId, customerId, reviewReactionId] = always(1);

    const reactionType = ReviewReactionEnum.like;

    await reviewReactionProvider.repo.save({
      reviewId,
      customerId,
      reactionType,
      id: reviewReactionId,
    });

    const reviewReaction =
      await reviewReactionProvider.getReviewReactionIfExists(
        reviewReactionId,
        customerId,
      );

    expect(reviewReaction).toBe(reactionType);
  });

  it('reviewProvider.getReviewReactionIfExists should return undefined if review does not exists', async () => {
    const [customerId, reviewReactionId] = always(2);

    const reviewReaction =
      await reviewReactionProvider.getReviewReactionIfExists(
        reviewReactionId,
        customerId,
      );

    expect(reviewReaction).toBeUndefined();
  });

  it('reviewProvider.findCustomerReviewsDetails should return reviewReaction if review exists', async () => {
    const [reviewId, customerId] = always(3);

    const reactionType = ReviewReactionEnum.like;

    await reviewReactionProvider.repo.save({
      reviewId,
      customerId: customerId,
      reactionType,
      id: 1,
    });

    const [reviewId2] = always(4);

    const reactionType2 = ReviewReactionEnum.dislike;

    await reviewReactionProvider.repo.save({
      reviewId: reviewId2,
      customerId: customerId,
      reactionType: reactionType2,
      id: 2,
    });

    const customerReviewsId = [reviewId, reviewId2];

    const reviewReaction =
      await reviewReactionProvider.findCustomerReviewsReactionDetail(
        customerId,
        customerReviewsId,
      );

    console.log({ reviewReaction });

    const expectedMap = new Map<number, CustomerReviewReactionDetailsResult>();
    expectedMap.set(reviewId, {
      reviewReactionId: expect.anything(),
      liked: true,
      disliked: false,
    });

    expectedMap.set(reviewId2, {
      reviewReactionId: expect.anything(),
      liked: false,
      disliked: true,
    });

    expect(reviewReaction).toEqual(expectedMap);
  });
});
