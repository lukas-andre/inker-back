import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing/test';
import { TestingModule } from '@nestjs/testing/testing-module';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

import { DefaultResponse } from '../global/infrastructure/helpers/defaultResponse.helper';

import { ReviewProvider } from './database/providers/review.provider';
import { ReviewHandler } from './reviews.handler';
import { RatingArtistUsecase } from './usecases/ratingArtist.usecase';

const moduleMocker = new ModuleMocker(global);
describe('ReviewHandler', () => {
  let handler: ReviewHandler;
  let ratingArtistUseCase: RatingArtistUsecase;

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
  });

  it('ReviewHandler should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('ReviewArtist should response ok', async () => {
    const result = await handler.reviewArtist(1, 1, 1, { displayName: 'test' });
    expect(result).toEqual(DefaultResponse.ok);
  });
});
