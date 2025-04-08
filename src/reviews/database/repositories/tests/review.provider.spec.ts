import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import sinon from 'sinon';
import { mock } from 'ts-mockito';
import {
  DataSource,
  EntityManager,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import { always } from '../../../../global/domain/utils/always';
import {
  DBServiceFindOneException,
  DBServiceSaveException,
} from '../../../../global/infrastructure/exceptions/dbService.exception';
import { ReviewReactionEnum } from '../../../../reactions/domain/enums/reviewReaction.enum';
import {
  ERROR_INSERTING_EMPTY_REVIEW,
  FAILED_TO_EXECUTE_IS_REVIEW_RATED_QUERY,
  PROBLEMS_FINDING_IF_USER_REVIEW_THE_EVENT,
} from '../../../codes';
import { ReviewReactionsDetail } from '../../../interfaces/review.interface';
import { RatingRate } from '../../../interfaces/reviewAvg.interface';
import { Review } from '../../entities/review.entity';
import { ReviewAvg } from '../../entities/reviewAvg.entity';
import { ReviewReaction } from '../../entities/reviewReaction.entity';

import {
  QueryRunnerFactory,
  QueryRunnerInterface,
  ReviewRepository,
} from '../review.repository';
import { ReviewAvgRepository } from '../reviewAvg.repository';
import { ReviewReactionRepository } from '../reviewReaction.repository';

describe('ReviewProvider', () => {
  const reviewToken = getRepositoryToken(Review);
  const reviewAvgToken = getRepositoryToken(ReviewAvg);
  const reviewReactionToken = getRepositoryToken(ReviewReaction);

  let reviewProvider: ReviewRepository;
  let reviewAvgProvider: ReviewAvgRepository;
  let reviewReactionProvider: ReviewReactionRepository;
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
        {
          provide: reviewReactionToken,
          useClass: Repository,
        },
        ReviewRepository,
        ReviewAvgRepository,
        ReviewReactionRepository,
      ],
    }).compile();

    reviewProvider = moduleFixture.get<ReviewRepository>(ReviewRepository);
    reviewAvgProvider = moduleFixture.get<ReviewAvgRepository>(ReviewAvgRepository);
    reviewReactionProvider = moduleFixture.get<ReviewReactionRepository>(
      ReviewReactionRepository,
    );
  });

  afterAll(async () => {
    await reviewProvider.repo.query('TRUNCATE TABLE review');
    await reviewAvgProvider.repo.query('TRUNCATE TABLE review_avg');
    await reviewReactionProvider.repo.query('TRUNCATE TABLE review_reaction');
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
      expect((error as Error).message).toBe(
        PROBLEMS_FINDING_IF_USER_REVIEW_THE_EVENT,
      );
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
    expect(review.reviewReactions).toStrictEqual({
      likes: 0,
      dislikes: 0,
    });
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
      expect((error as Error).message).toBe(ERROR_INSERTING_EMPTY_REVIEW);
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
    expect(updatedReview.reviewReactions).toStrictEqual({
      likes: 0,
      dislikes: 0,
    });

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
    const rating = RatingRate.FOUR_HALF;

    const review = await reviewProvider.createReviewTransaction(
      artistId,
      eventId,
      customerId,
      {
        displayName: 'test display name 12',
        header: 'test header 12',
        comment: 'test comment 12',
        rating,
      },
    );
    expect(review).toBeDefined();
    expect(review).toBe(true);

    const oldReviewValue = { value: rating };

    interface QueryBuilderStubInterface {
      select(): QueryBuilderStubInterface;
      from(): QueryBuilderStubInterface;
      where(): QueryBuilderStubInterface;
      andWhere(): QueryBuilderStubInterface;
      getRawOne(): Promise<{ value: number }>;
      update(): QueryBuilderStubInterface;
      set(): QueryBuilderStubInterface;
      execute(): Promise<void>;
    }

    const queryBuilderStub =
      sinon.stub() as unknown as Partial<QueryBuilderStubInterface>;

    queryBuilderStub.select = sinon.stub().returns(queryBuilderStub);
    queryBuilderStub.from = sinon.stub().returns(queryBuilderStub);
    queryBuilderStub.where = sinon.stub().returns(queryBuilderStub);
    queryBuilderStub.andWhere = sinon.stub().returns(queryBuilderStub);
    queryBuilderStub.getRawOne = sinon
      .stub()
      .returns(Promise.resolve(oldReviewValue));
    queryBuilderStub.update = sinon.stub().returns(queryBuilderStub);
    queryBuilderStub.set = sinon.stub().returns(queryBuilderStub);
    queryBuilderStub.execute = sinon.stub().returns(Promise.resolve());

    const mockQueryRunner: QueryRunnerInterface = {
      startTransaction: jest.fn(() => Promise.resolve()),
      commitTransaction: jest.fn(() => Promise.resolve()),
      rollbackTransaction: jest.fn(() => Promise.resolve()),
      connect: jest.fn(() => Promise.resolve()),
      manager: mock<EntityManager>(),
      release: jest.fn(() => Promise.resolve()),
      query: jest.fn((query: string, parameters?: unknown[]): Promise<any> => {
        return Promise.resolve([undefined]);
      }),
    };

    jest.spyOn(QueryRunnerFactory, 'create').mockReturnValue(mockQueryRunner);
    jest
      .spyOn(mockQueryRunner.manager, 'createQueryBuilder')
      .mockImplementation(
        () => queryBuilderStub as unknown as SelectQueryBuilder<Review>,
      );

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

  it('reviewProvider.isReviewRated should return false if the review is not rated', async () => {
    const [artistId, eventId, customerId] = always(13);

    await reviewProvider.insertEmptyReview(
      artistId,
      eventId,
      customerId,
      'test display name 13',
    );

    const review = await reviewProvider.repo.findOne({
      where: {
        artistId,
        eventId,
        createdBy: customerId,
      },
    });

    const isRated = await reviewProvider.isReviewRated(review.id);

    expect(isRated).toBeDefined();
    expect(isRated).toBe(false);
  });

  it('reviewProvider.isReviewRated should return true if the review is rated', async () => {
    const [artistId, eventId, customerId] = always(14);

    const reviewTransactionResult =
      await reviewProvider.createReviewTransaction(
        artistId,
        eventId,
        customerId,
        {
          displayName: 'test display name 14',
          header: 'test header 14',
          comment: 'test comment 14',
          rating: 5,
        },
      );

    expect(reviewTransactionResult).toBeDefined();
    expect(reviewTransactionResult).toBe(true);

    const review = await reviewProvider.repo.findOne({
      where: {
        artistId,
        eventId,
        createdBy: customerId,
      },
    });

    const isRated = await reviewProvider.isReviewRated(review.id);

    expect(isRated).toBeDefined();
    expect(isRated).toBe(true);
  });

  it('reviewProvider.isReviewRated should return undefined if review do not exists', async () => {
    const [reviewId] = always(15);

    const isRated = await reviewProvider.isReviewRated(reviewId);

    expect(isRated).not.toBeDefined();
    expect(isRated).toBe(undefined);
  });

  it('reviewProvider.isReviewRated should throw an error if something goes wrong', async () => {
    const [reviewId] = always(16);

    jest
      .spyOn(reviewProvider.repo, 'createQueryBuilder')
      .mockImplementation(() => {
        throw new Error('test error 5');
      });

    try {
      await reviewProvider.isReviewRated(reviewId);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(DBServiceFindOneException);
      expect((error as Error).message).toBe(
        FAILED_TO_EXECUTE_IS_REVIEW_RATED_QUERY,
      );
    }
  });

  it('reviewProvider.insertReviewReactionTransaction should return true if the review reaction is inserted', async () => {
    const [artistId, eventId, customerId] = always(17);

    const reviewTransactionResult =
      await reviewProvider.createReviewTransaction(
        artistId,
        eventId,
        customerId,
        {
          displayName: 'test display name 17',
          header: 'test header 17',
          comment: 'test comment 17',
          rating: 5,
        },
      );

    expect(reviewTransactionResult).toBeDefined();
    expect(reviewTransactionResult).toBe(true);

    const review = await reviewProvider.repo.findOne({
      where: {
        artistId,
        eventId,
        createdBy: customerId,
      },
    });

    // jest
    //   .spyOn(reviewProvider.source, 'query')
    //   .mockImplementationOnce(() => Promise.resolve(['cosa']))
    //   .mockImplementationOnce(() => Promise.resolve(['cosa2']));

    const reactionTransactionResult =
      await reviewProvider.insertReviewReactionTransaction(
        review.id,
        customerId,
        ReviewReactionEnum.like,
      );

    expect(reactionTransactionResult).toBeDefined();
    expect(reactionTransactionResult).toBe(true);

    const { reviewReactions }: Pick<Review, 'reviewReactions'> =
      await reviewProvider.repo.findOne({
        select: ['reviewReactions'],
        where: {
          id: review.id,
        },
      });

    console.log({ reviewReactions });

    expect(reviewReactions).toBeDefined();
    expect(reviewReactions).toStrictEqual({
      likes: 1,
      dislikes: 0,
    } as ReviewReactionsDetail);

    const reviewReaction = await reviewReactionProvider.repo.findOne({
      where: {
        reviewId: review.id,
      },
    });

    console.log({ reviewReaction });

    expect(reviewReaction).toBeDefined();
    expect(reviewReaction.customerId).toBe(customerId);
    expect(reviewReaction.reviewId).toBe(review.id);
    expect(reviewReaction.reactionType).toBe(ReviewReactionEnum.like);
  });

  it('reviewProvider.insertReviewReactionTransaction should return false if the review reaction is not inserted', async () => {
    const [customerId, reviewId] = always(18);

    const reactionTransactionResult =
      await reviewProvider.insertReviewReactionTransaction(
        reviewId,
        customerId,
        ReviewReactionEnum.like,
      );

    expect(reactionTransactionResult).toBeDefined();
    expect(reactionTransactionResult).toBe(false);
  });

  it('reviewProvider.updateReviewReactionTransaction should return true if the review reaction is updated', async () => {
    const [artistId, eventId, customerId] = always(19);

    const reviewTransactionResult =
      await reviewProvider.createReviewTransaction(
        artistId,
        eventId,
        customerId,
        {
          displayName: 'test display name 19',
          header: 'test header 19',
          comment: 'test comment 19',
          rating: 5,
        },
      );

    expect(reviewTransactionResult).toBeDefined();
    expect(reviewTransactionResult).toBe(true);

    const review = await reviewProvider.repo.findOne({
      where: {
        artistId,
        eventId,
        createdBy: customerId,
      },
    });

    const reactionTransactionResult =
      await reviewProvider.insertReviewReactionTransaction(
        review.id,
        customerId,
        ReviewReactionEnum.like,
      );

    expect(reactionTransactionResult).toBeDefined();
    expect(reactionTransactionResult).toBe(true);

    const { reviewReactions }: Pick<Review, 'reviewReactions'> =
      await reviewProvider.repo.findOne({
        select: ['reviewReactions'],
        where: {
          id: review.id,
        },
      });

    expect(reviewReactions).toBeDefined();
    expect(reviewReactions).toStrictEqual({
      likes: 1,
      dislikes: 0,
    } as ReviewReactionsDetail);

    const reviewReaction = await reviewReactionProvider.repo.findOne({
      where: {
        reviewId: review.id,
      },
    });

    expect(reviewReaction).toBeDefined();
    expect(reviewReaction.customerId).toBe(customerId);
    expect(reviewReaction.reviewId).toBe(review.id);
    expect(reviewReaction.reactionType).toBe(ReviewReactionEnum.like);

    const updateReactionTransactionResult =
      await reviewProvider.updateReviewReactionTransaction(
        reviewReaction.reactionType,
        review.id,
        customerId,
        ReviewReactionEnum.dislike,
      );

    expect(updateReactionTransactionResult).toBeDefined();
    expect(updateReactionTransactionResult).toBe(true);

    const { reviewReactions: updatedReviewReactions } =
      await reviewProvider.repo.findOne({
        select: ['reviewReactions'],
        where: {
          id: review.id,
        },
      });

    expect(updatedReviewReactions).toBeDefined();
    expect(updatedReviewReactions).toStrictEqual({
      likes: 0,
      dislikes: 1,
    } as ReviewReactionsDetail);

    const updatedReviewReaction = await reviewReactionProvider.repo.findOne({
      where: {
        reviewId: review.id,
      },
    });

    expect(updatedReviewReaction).toBeDefined();
    expect(updatedReviewReaction.customerId).toBe(customerId);
    expect(updatedReviewReaction.reactionType).toBe(ReviewReactionEnum.dislike);
  });

  it('reviewProvider.updateReviewReactionTransaction should return false if the review reaction is not updated', async () => {
    const [customerId, reviewId] = always(20);

    const updateReactionTransactionResult =
      await reviewProvider.updateReviewReactionTransaction(
        ReviewReactionEnum.like,
        reviewId,
        customerId,
        ReviewReactionEnum.dislike,
      );

    expect(updateReactionTransactionResult).toBeDefined();
    expect(updateReactionTransactionResult).toBe(false);
  });

  it('reviewProvider.offReviewReactionTransaction should return true if the review reaction is putted off', async () => {
    const [artistId, eventId, customerId] = always(21);

    const reviewTransactionResult =
      await reviewProvider.createReviewTransaction(
        artistId,
        eventId,
        customerId,
        {
          displayName: 'test display name 21',
          header: 'test header 21',
          comment: 'test comment 21',
          rating: 5,
        },
      );

    expect(reviewTransactionResult).toBeDefined();
    expect(reviewTransactionResult).toBe(true);

    const review = await reviewProvider.repo.findOne({
      where: {
        artistId,
        eventId,
        createdBy: customerId,
      },
    });

    const reactionTransactionResult =
      await reviewProvider.insertReviewReactionTransaction(
        review.id,
        customerId,
        ReviewReactionEnum.like,
      );

    expect(reactionTransactionResult).toBeDefined();
    expect(reactionTransactionResult).toBe(true);

    const { reviewReactions }: Pick<Review, 'reviewReactions'> =
      await reviewProvider.repo.findOne({
        select: ['reviewReactions'],
        where: {
          id: review.id,
        },
      });

    expect(reviewReactions).toBeDefined();
    expect(reviewReactions).toStrictEqual({
      likes: 1,
      dislikes: 0,
    } as ReviewReactionsDetail);

    const reviewReaction = await reviewReactionProvider.repo.findOne({
      where: {
        reviewId: review.id,
      },
    });

    expect(reviewReaction).toBeDefined();
    expect(reviewReaction.customerId).toBe(customerId);
    expect(reviewReaction.reviewId).toBe(review.id);
    expect(reviewReaction.reactionType).toBe(ReviewReactionEnum.like);

    const offReactionTransactionResult =
      await reviewProvider.offReviewReactionTransaction(
        reviewReaction.reactionType,
        review.id,
        customerId,
      );

    expect(offReactionTransactionResult).toBeDefined();
    expect(offReactionTransactionResult).toBe(true);

    const { reviewReactions: updatedReviewReactions } =
      await reviewProvider.repo.findOne({
        select: ['reviewReactions'],
        where: {
          id: review.id,
        },
      });

    expect(updatedReviewReactions).toBeDefined();
    expect(updatedReviewReactions).toStrictEqual({
      likes: 0,
      dislikes: 0,
    } as ReviewReactionsDetail);

    const updatedReviewReaction = await reviewReactionProvider.repo.findOne({
      where: {
        reviewId: review.id,
      },
    });

    expect(updatedReviewReaction).toBeDefined();
    expect(updatedReviewReaction.customerId).toBe(customerId);
    expect(updatedReviewReaction.reactionType).toBe(ReviewReactionEnum.off);
    expect(updatedReviewReaction.reviewId).toBe(review.id);
  });

  it('reviewProvider.offReviewReactionTransaction should return false if the review reaction is not putted off', async () => {
    const [customerId, reviewId] = always(22);

    const offReactionTransactionResult =
      await reviewProvider.offReviewReactionTransaction(
        ReviewReactionEnum.like,
        reviewId,
        customerId,
      );

    expect(offReactionTransactionResult).toBeDefined();
    expect(offReactionTransactionResult).toBe(false);
  });
});
