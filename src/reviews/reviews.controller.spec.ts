import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing/test';
import { TestingModule } from '@nestjs/testing/testing-module';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

import { AgendaEventRepository } from '../agenda/infrastructure/repositories/agendaEvent.repository';
import { ArtistRepository } from '../artists/infrastructure/repositories/artist.repository';
import { ReviewReactionEnum } from '../reactions/domain/enums/reviewReaction.enum';

import { ReviewRepository } from './database/repositories/review.repository';
import { ReviewsController } from './reviews.controller';
import { ReviewHandler } from './reviews.handler';
import { UsersRepository } from '../users/infrastructure/repositories/users.repository';

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
          provide: ReviewRepository,
          useValue: createMock<ReviewRepository>(),
        },
      ],
    })
      .useMocker(token => {
        if (token === UsersRepository) {
          return jest.fn();
        }

        if (token === AgendaEventRepository) {
          return jest.fn();
        }

        if (token === ArtistRepository) {
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
    await controller.reviewArtist('1', '1', '1', {
      displayName: 'test',
    });

    expect(handler.reviewArtist).toBeCalled();
  });

  it('ReviewsController.reactToReview should call handler.reactToReview', async () => {
    await controller.reactToReview('1', '1', ReviewReactionEnum.like);

    expect(handler.reactToReview).toBeCalled();
  });
});
