import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing/test';
import { TestingModule } from '@nestjs/testing/testing-module';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

import { AgendaEventProvider } from '../agenda/infrastructure/providers/agendaEvent.provider';
import { ArtistProvider } from '../artists/infrastructure/database/artist.provider';
import { ReviewReactionEnum } from '../reactions/domain/enums/reviewReaction.enum';
import { UsersProvider } from '../users/infrastructure/providers/users.provider';

import { ReviewProvider } from './database/providers/review.provider';
import { ReviewsController } from './reviews.controller';
import { ReviewHandler } from './reviews.handler';

const moduleMocker = new ModuleMocker(global);
describe('ReviewsController', () => {
  let controller: ReviewsController;
  let handler: ReviewHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewHandler,
          useValue: createMock<ReviewHandler>({
            reviewArtist: jest.fn(),
            reactToReview: jest.fn(),
          }),
        },
        {
          provide: ReviewProvider,
          useValue: createMock<ReviewProvider>(),
        },
      ],
    })
      .useMocker(token => {
        if (token === UsersProvider) {
          return jest.fn();
        }

        if (token === AgendaEventProvider) {
          return jest.fn();
        }

        if (token === ArtistProvider) {
          return jest.fn();
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

    controller = module.get<ReviewsController>(ReviewsController);
    handler = module.get<ReviewHandler>(ReviewHandler);
  });

  it('ReviewsController should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('ReviewsController.reviewArtist should call handler.reviewArtist', async () => {
    await controller.reviewArtist(1, 1, 1, {
      displayName: 'test',
    });

    expect(handler.reviewArtist).toBeCalled();
  });

  it('ReviewsController.reactToReview should call handler.reactToReview', async () => {
    await controller.reactToReview(1, 1, ReviewReactionEnum.like);

    expect(handler.reactToReview).toBeCalled();
  });
});
