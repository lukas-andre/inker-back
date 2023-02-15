import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { REVIEW_DB_CONNECTION_NAME } from '../../../databases/constants';
import { always } from '../../../global/domain/utils/always';
import { ReviewReactionEnum } from '../../../reactions/domain/enums/reviewReaction.enum';
import { Review } from '../entities/review.entity';
import { ReviewAvg } from '../entities/reviewAvg.entity';
import { ReviewReaction } from '../entities/reviewReaction.entity';

import { ReviewReactionProvider } from './reviewReaction.provider';

describe('ReviewReactionProvider', () => {
  const reviewReactionToken = getRepositoryToken(ReviewReaction);
  const entities = [Review, ReviewAvg, ReviewReaction];
  let reviewReactionProvider: ReviewReactionProvider;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
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
          dropSchema: true,
          logging: true,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forFeature(entities, REVIEW_DB_CONNECTION_NAME),
      ],
      providers: [
        {
          provide: reviewReactionToken,
          useClass: Repository,
        },
        ReviewReactionProvider,
      ],
    }).compile();

    reviewReactionProvider = moduleFixture.get<ReviewReactionProvider>(
      ReviewReactionProvider,
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
    const [reviewId, userId, reviewReactionId] = always(1);

    const reactionType = ReviewReactionEnum.like;

    await reviewReactionProvider.repo.save({
      reviewId,
      userId,
      reactionType,
      id: reviewReactionId,
    });

    const reviewReaction =
      await reviewReactionProvider.getReviewReactionIfExists(reviewReactionId);

    expect(reviewReaction).toBe(reactionType);
  });

  it('reviewProvider.getReviewReactionIfExists should return undefined if review does not exists', async () => {
    const reviewReactionId = 2;

    const reviewReaction =
      await reviewReactionProvider.getReviewReactionIfExists(reviewReactionId);

    expect(reviewReaction).toBeUndefined();
  });
});
