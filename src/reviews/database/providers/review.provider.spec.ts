import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from '../entities/review.entity';
import { ReviewAvg } from '../entities/reviewAvg.entity';
import { ReviewReaction } from '../entities/reviewReaction.entity';

import { ReviewProvider } from './review.provider';

describe('ReviewProvider', () => {
  const token = getRepositoryToken(Review);
  let reviewProvider: ReviewProvider;
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
        }),
        TypeOrmModule.forFeature(
          [Review, ReviewAvg, ReviewReaction],
          'review-db',
        ),
      ],
      providers: [
        {
          provide: token,
          useClass: Repository,
        },
        ReviewProvider,
      ],
    }).compile();

    reviewProvider = moduleFixture.get<ReviewProvider>(ReviewProvider);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', async () => {
    expect(reviewProvider).toBeDefined();
  });

  it('should create a review', async () => {
    const review = await reviewProvider.repo.save({
      id: 1,
      customerId: 1,
      eventId: 1,
      artistId: 1,
      createBy: 1,
      displayName: 'test',
      content: 'test',
      value: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRated: true,
    } as Review);

    console.log(review);

    expect(review).toBeDefined();
  });
});
