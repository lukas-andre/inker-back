import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';

import { Review } from '../database/entities/review.entity';
import { ReviewProvider } from '../database/providers/review.provider';
import { ReviewReactionProvider } from '../database/providers/reviewReaction.provider';

import { GetReviewsFromArtistUsecase } from './getReviewsFromArtist.usecase';

describe('GetReviewsFromArtistUsecase', () => {
  let usecase: GetReviewsFromArtistUsecase;
  let reviewProvider: DeepMocked<ReviewProvider>;
  let reviewReactionProvider: DeepMocked<ReviewReactionProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetReviewsFromArtistUsecase,
        {
          provide: ReviewProvider,
          useValue: createMock<ReviewProvider>(),
        },
        {
          provide: ReviewReactionProvider,
          useValue: createMock<ReviewReactionProvider>(),
        },
      ],
    }).compile();

    usecase = module.get<GetReviewsFromArtistUsecase>(
      GetReviewsFromArtistUsecase,
    );
    reviewProvider = module.get(ReviewProvider);
    reviewReactionProvider = module.get(ReviewReactionProvider);
  });

  it('GetReviewsFromArtistUsecase should be defined', () => {
    expect(usecase).toBeDefined();
  });

  it(`GetReviewsFromArtistUsecase should call reviewProvider.paginate and reviewReactionProvider.findCustomerReviewsReactionDetail and return reviews with customerReactionDetail`, async () => {
    const artistId = 1;
    const page = 1;
    const limit = 10;
    const customerId = 1;

    const customerReviewReactionDetail = new Map();
    customerReviewReactionDetail.set(1, { reaction: 'like' });

    const review1 = {
      id: 1,
      artistId: 1,
      content: 'content',
      eventId: 1,
      createdBy: 1,
      isRated: false,
      displayName: 'displayName',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const review2 = {
      id: 2,
      artistId: 2,
      content: 'content',
      eventId: 2,
      createdBy: 2,
      isRated: false,
      displayName: 'displayName',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const reviews = new Pagination<Review, IPaginationMeta>(
      [review1, review2],
      {
        itemCount: 2,
        totalItems: 2,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    );

    reviewProvider.paginate.mockResolvedValueOnce(reviews);
    reviewReactionProvider.findCustomerReviewsReactionDetail.mockResolvedValueOnce(
      customerReviewReactionDetail,
    );

    const result = await usecase.execute(customerId, artistId, page, limit);

    expect(reviewProvider.paginate).toBeCalledWith(artistId, { page, limit });
    expect(
      reviewReactionProvider.findCustomerReviewsReactionDetail,
    ).toBeCalledWith(
      customerId,
      reviews.items.map(review => review.id),
    );

    expect(result).toEqual({
      ...reviews,
      items: [
        { ...review1, customerReactionDetail: { reaction: 'like' } },
        { ...review2, customerReactionDetail: undefined },
      ],
    } as any);
  });
});
