import { Test } from '@nestjs/testing/test';
import { TestingModule } from '@nestjs/testing/testing-module';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

import { AgendaEventProvider } from '../agenda/infrastructure/providers/agendaEvent.provider';
import { ArtistsDbService } from '../artists/infrastructure/database/services/artistsDb.service';
import { DefaultResponse } from '../global/infrastructure/helpers/defaultResponse.helper';
import { UsersService } from '../users/domain/services/users.service';

import { ReviewsController } from './reviews.controller';
import { ReviewHandler } from './reviews.handler';

const moduleMocker = new ModuleMocker(global);
describe('ReviewsController', () => {
  let controller: ReviewsController;
  let handler: ReviewHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
    })
      .useMocker(token => {
        if (token === ReviewHandler) {
          return {
            reviewArtist: jest.fn(() => DefaultResponse.ok),
          };
        }

        if (token === UsersService) {
          return jest.fn();
        }

        if (token === AgendaEventProvider) {
          return jest.fn();
        }

        if (token === ArtistsDbService) {
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

  it('ReviewArtist should response ok', async () => {
    const response = await controller.reviewArtist(1, 1, 1, {
      displayName: 'test',
    });

    expect(response).toEqual(DefaultResponse.ok);
  });

  it('ReviewArtist should call handler.reviewArtist', async () => {
    await controller.reviewArtist(1, 1, 1, {
      displayName: 'test',
    });

    expect(handler.reviewArtist).toBeCalled();
  });

  it('Review should response list of reviews', async () => {});
});
