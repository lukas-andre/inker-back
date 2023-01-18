import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { always } from '../../../global/domain/utils/always';
import {
  DBServiceFindOneException,
  DBServiceSaveException,
} from '../../../global/infrastructure/exceptions/dbService.exception';
import {
  ERROR_INSERTING_EMPTY_REVIEW,
  PROBLEMS_FINDING_IF_USER_REVIEW_THE_EVENT,
} from '../../codes';
import { Review } from '../entities/review.entity';
import { RatingRate, ReviewAvg } from '../entities/reviewAvg.entity';
import { ReviewReaction } from '../entities/reviewReaction.entity';

import { ReviewProvider } from './review.provider';
import { ReviewAvgProvider } from './reviewAvg.provider';

describe('ReviewProvider', () => {
  const reviewToken = getRepositoryToken(Review);
  const reviewAvgToken = getRepositoryToken(ReviewAvg);

  let reviewProvider: ReviewProvider;
  let reviewAvgProvider: ReviewAvgProvider;
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
          entities: [Review, ReviewAvg, ReviewReaction],
          synchronize: true,
          dropSchema: true,
          logging: true,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forFeature(
          [Review, ReviewAvg, ReviewReaction],
          'review-db',
        ),
      ],
      providers: [
        {
          provide: reviewToken,
          useClass: Repository,
        },
        {
          provide: reviewAvgToken,
          useClass: Repository,
        },
        ReviewProvider,
        ReviewAvgProvider,
      ],
    }).compile();

    reviewProvider = moduleFixture.get<ReviewProvider>(ReviewProvider);
    reviewAvgProvider = moduleFixture.get<ReviewAvgProvider>(ReviewAvgProvider);
  });

  afterAll(async () => {
    await reviewProvider.repo.query('TRUNCATE TABLE review');
    await reviewAvgProvider.repo.query('TRUNCATE TABLE review_avg');
    await moduleFixture.close();
  });

  it('reviewProvider should be defined', async () => {
    expect(reviewProvider).toBeDefined();
  });

  it('reviewProvider.repo should be defined as Repository', async () => {
    expect(reviewProvider.repo).toBeDefined();
    expect(reviewProvider.repo).toBeInstanceOf(Repository);
  });

  it('reviewProvider.source should be defined as DataSource', async () => {
    expect(reviewProvider.source).toBeDefined();
    expect(reviewProvider.source).toBeInstanceOf(DataSource);
  });

  it('reviewProvider.manager should be defined as EntityManager', async () => {
    expect(reviewProvider.manager).toBeDefined();
    expect(reviewProvider.manager).toBeInstanceOf(EntityManager);
  });

  it('reviewProvider.exists should return true if review exits', async () => {
    const [artistId, eventId, customerId, reviewId] = always(1);

    await reviewProvider.repo.save({
      id: reviewId,
      customerId,
      eventId,
      artistId,
      createdBy: customerId,
      displayName: 'test',
      isRated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Partial<Review>);

    const review = await reviewProvider.exists(reviewId);

    expect(review).toBeDefined();
    expect(review).toBe(true);
  });

  it('reviewProvider.exists should return false if review does not exist', async () => {
    const review = await reviewProvider.exists(2);

    expect(review).toBeDefined();
    expect(review).toBe(false);
  });

  it('reviewProvider.findIfCustomerAlreadyReviewTheEvent should return { id: number, isRated: boolean } if found a review', async () => {
    const [artistId, eventId, customerId] = always(3);

    await reviewProvider.repo.save({
      customerId,
      eventId,
      artistId,
      createdBy: customerId,
      displayName: 'test',
      isRated: true,
      content: 'test',
      value: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Partial<Review>);

    const review = await reviewProvider.findIfCustomerAlreadyReviewTheEvent(
      customerId,
      eventId,
      artistId,
    );

    expect(review).toBeDefined();
    expect(review.isRated).toBe(true);
  });

  it('reviewProvider.findIfCustomerAlreadyReviewTheEvent should return undefined if not found a review', async () => {
    const [artistId, eventId, customerId] = always(4);

    const review = await reviewProvider.findIfCustomerAlreadyReviewTheEvent(
      customerId,
      eventId,
      artistId,
    );

    expect(review).toBeUndefined();
  });

  it('reviewProvider.findIfCustomerAlreadyReviewTheEvent should throw an DBServiceFindOneException(PROBLEMS_FINDING_IF_USER_REVIEW_THE_EVENT)', async () => {
    const [artistId, eventId, customerId] = always(0);

    jest
      .spyOn(reviewProvider.repo, 'createQueryBuilder')
      .mockImplementation(() => {
        throw new Error('test error 1');
      });

    try {
      await reviewProvider.findIfCustomerAlreadyReviewTheEvent(
        customerId,
        eventId,
        artistId,
      );
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(DBServiceFindOneException);
      expect(error.message).toBe(PROBLEMS_FINDING_IF_USER_REVIEW_THE_EVENT);
    }

    jest.restoreAllMocks();
  });

  it('reviewProvider.insertEmptyReview should insert a new review', async () => {
    const [artistId, eventId, customerId] = always(5);

    await reviewProvider.insertEmptyReview(
      artistId,
      eventId,
      customerId,
      'test',
    );

    const review = await reviewProvider.repo.findOne({
      where: { artistId, eventId, createdBy: customerId },
    });

    expect(review).toBeDefined();
    expect(review.id).toBeDefined();
    expect(review.content).toBeNull();
    expect(review.createdBy).toBe(customerId);
    expect(review.displayName).toBe('test');
    expect(review.eventId).toBe(eventId);
    expect(review.header).toBeNull();
    expect(review.isRated).toBe(false);
    expect(review.artistId).toBe(artistId);
    expect(review.value).toBeNull();
    expect(review.reviewReactions).toStrictEqual({});
  });

  it('reviewProvider.insertEmptyReview should throw an DBServiceInsertException(ERROR_INSERTING_EMPTY_REVIEW)', async () => {
    const [artistId, eventId, customerId] = always(0);
    jest
      .spyOn(reviewProvider.repo, 'createQueryBuilder')
      .mockImplementation(() => {
        throw new Error('test error 2');
      });

    try {
      await reviewProvider.insertEmptyReview(
        artistId,
        eventId,
        customerId,
        'test',
      );
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(DBServiceSaveException);
      expect(error.message).toBe(ERROR_INSERTING_EMPTY_REVIEW);
    }

    jest.restoreAllMocks();
  });

  it('reviewProvider.createReviewTransaction should create a new review', async () => {
    const [artistId, eventId, customerId] = always(6);

    const review = await reviewProvider.createReviewTransaction(
      artistId,
      eventId,
      customerId,
      {
        displayName: 'test display name 1',
        header: 'test header 1',
        comment: 'test comment 1',
        rating: 5,
      },
    );

    expect(review).toBeDefined();
    expect(review).toBe(true);
  });

  it('reviewProvider.updateReviewTransaction should update a review', async () => {
    const [artistId, eventId, customerId] = always(7);

    await reviewProvider.createReviewTransaction(
      artistId,
      eventId,
      customerId,
      {
        displayName: 'test display name',
        header: 'test header',
        comment: 'test comment',
        rating: 5,
      },
    );

    const review = await reviewProvider.updateReviewTransaction(
      artistId,
      eventId,
      customerId,
      {
        displayName: 'test display name',
        comment: 'test comment updated',
        rating: 4,
      },
    );

    expect(review).toBeDefined();
    expect(review).toBe(true);

    const updatedReview = await reviewProvider.repo.findOne({
      where: { artistId, eventId, createdBy: customerId },
    });

    expect(updatedReview).toBeDefined();
    expect(updatedReview.content).toBe('test comment updated');
    expect(updatedReview.createdBy).toBe(customerId);
    expect(updatedReview.displayName).toBe('test display name');
    expect(updatedReview.eventId).toBe(eventId);
    expect(updatedReview.header).toBe('test header');
    expect(updatedReview.isRated).toBe(true);
    expect(updatedReview.artistId).toBe(artistId);
    expect(updatedReview.value).toBe(4);
    expect(updatedReview.reviewReactions).toStrictEqual({});

    const reviewAvg = await reviewAvgProvider.repo.findOne({
      where: { artistId },
    });

    expect(reviewAvg).toBeDefined();
    expect(reviewAvg.artistId).toBe(artistId);
    expect(reviewAvg.value).toBe(4);
    expect(reviewAvg.count).toBe(1);
    expect(reviewAvg.updatedAt).toBeDefined();
    expect(reviewAvg.createdAt).toBeDefined();
    expect(reviewAvg.detail).toStrictEqual({
      [RatingRate.ONE]: 0,
      [RatingRate.TWO]: 0,
      [RatingRate.THREE]: 0,
      [RatingRate.FOUR]: 1,
      [RatingRate.FIVE]: 0,
      [RatingRate.ONE_HALF]: 0,
      [RatingRate.TWO_HALF]: 0,
      [RatingRate.THREE_HALF]: 0,
      [RatingRate.FOUR_HALF]: 0,
    });
  });

  it('reviewProvider.createReviewTransaction should handle the correct avg value for two or more reviews', async () => {
    const [artistId, eventId, customerId] = always(8);

    const review = await reviewProvider.createReviewTransaction(
      artistId,
      eventId,
      customerId,
      {
        displayName: 'test display name 8',
        header: 'test header 8',
        comment: 'test comment 8',
        rating: RatingRate.FOUR_HALF,
      },
    );
    expect(review).toBeDefined();
    expect(review).toBe(true);

    const review2 = await reviewProvider.createReviewTransaction(
      artistId,
      eventId,
      customerId + 1,
      {
        displayName: 'test display name 9',
        header: 'test header 9',
        comment: 'test comment 9',
        rating: RatingRate.THREE,
      },
    );

    expect(review2).toBeDefined();
    expect(review2).toBe(true);

    const reviewAvg = await reviewAvgProvider.repo.findOne({
      where: { artistId },
    });

    expect(reviewAvg).toBeDefined();
    expect(reviewAvg.artistId).toBe(artistId);
    expect(reviewAvg.value).toBe((RatingRate.FOUR_HALF + RatingRate.THREE) / 2);
    expect(reviewAvg.count).toBe(2);
    expect(reviewAvg.updatedAt).toBeDefined();
    expect(reviewAvg.createdAt).toBeDefined();
    expect(reviewAvg.detail).toStrictEqual({
      [RatingRate.ONE]: 0,
      [RatingRate.TWO]: 0,
      [RatingRate.THREE]: 1,
      [RatingRate.FOUR]: 0,
      [RatingRate.FIVE]: 0,
      [RatingRate.ONE_HALF]: 0,
      [RatingRate.TWO_HALF]: 0,
      [RatingRate.THREE_HALF]: 0,
      [RatingRate.FOUR_HALF]: 1,
    });
  });

  it('reviewProvider.createReviewTransaction should rollback the transaction if something goes wrong', async () => {
    const [artistId, eventId, customerId] = always(9);

    jest
      .spyOn(reviewProvider.source, 'createQueryBuilder')
      .mockImplementation(() => {
        throw new Error('test error 3');
      });

    const review = await reviewProvider.createReviewTransaction(
      artistId,
      eventId,
      customerId,
      {
        displayName: 'test display name 9',
        header: 'test header 9',
        comment: 'test comment 9',
        rating: 5,
      },
    );

    expect(review).toBeDefined();
    expect(review).toBe(false);

    jest.restoreAllMocks();
  });

  it('reviewProvider.updateReviewTransaction should rollback the transaction if something goes wrong', async () => {
    const [artistId, eventId, customerId] = always(10);

    jest
      .spyOn(reviewProvider.source, 'createQueryBuilder')
      .mockImplementation(() => {
        throw new Error('test error 4');
      });

    const review = await reviewProvider.updateReviewTransaction(
      artistId,
      eventId,
      customerId,
      {
        displayName: 'test display name 10',
        header: 'test header 10',
        comment: 'test comment 10',
        rating: 5,
      },
    );

    expect(review).toBeDefined();
    expect(review).toBe(false);

    jest.restoreAllMocks();
  });

  it('reviewProvider.updateReviewAvg should throw an error if the review is not found', async () => {
    const [artistId, eventId, customerId] = always(11);

    const review = await reviewProvider.updateReviewTransaction(
      artistId,
      eventId,
      customerId,
      {
        displayName: 'test display name 11',
        header: 'test header 11',
        comment: 'test comment 11',
        rating: 5,
      },
    );

    expect(review).toBeDefined();
    expect(review).toBe(false);

    jest.restoreAllMocks();
  });

  it('reviewProvider.updateReviewAvg should throw an error if the review avg is not found', async () => {
    const [artistId, eventId, customerId] = always(12);

    const review = await reviewProvider.createReviewTransaction(
      artistId,
      eventId,
      customerId,
      {
        displayName: 'test display name 12',
        header: 'test header 12',
        comment: 'test comment 12',
        rating: RatingRate.FOUR_HALF,
      },
    );
    expect(review).toBeDefined();
    expect(review).toBe(true);

    jest
      .spyOn(reviewProvider, 'findReviewAvgTransaction')
      .mockResolvedValue(undefined);

    const review2 = await reviewProvider.updateReviewTransaction(
      artistId,
      eventId,
      customerId,
      {
        displayName: 'test display name 12 updated',
        header: 'test header 12 updated',
        comment: 'test comment 12 updated',
        rating: RatingRate.FOUR_HALF,
      },
    );

    expect(review2).toBeDefined();
    expect(review2).toBe(false);

    jest.restoreAllMocks();
  });
});
