import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { Agenda } from '../../agenda/infrastructure/entities/agenda.entity';
import { AgendaProvider } from '../../agenda/infrastructure/providers/agenda.provider';
import { DomainUnProcessableEntity } from '../../global/domain/exceptions/domain.exception';
import { DefaultResponseStatus } from '../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../global/infrastructure/helpers/defaultResponse.helper';
import { USER_IS_NOT_RELATED_TO_EVENT } from '../../users/domain/errors/codes';
import { USER_ALREADY_REVIEW_THE_EVENT } from '../codes';
import { Review } from '../database/entities/review.entity';
import { ReviewProvider } from '../database/providers/review.provider';

import { RatingArtistUsecase } from './ratingArtist.usecase';

describe('RatingArtistUsecase', () => {
  let usecase: RatingArtistUsecase;
  let reviewProvider: DeepMocked<ReviewProvider>;
  let agendaProvider: DeepMocked<AgendaProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingArtistUsecase,
        {
          provide: ReviewProvider,
          useValue: createMock<ReviewProvider>(),
        },
        {
          provide: AgendaProvider,
          useValue: createMock<AgendaProvider>(),
        },
      ],
    }).compile();

    usecase = module.get<RatingArtistUsecase>(RatingArtistUsecase);
    reviewProvider = module.get(ReviewProvider);
    agendaProvider = module.get(AgendaProvider);
  });

  it('RatingArtistUsecase should be defined', () => {
    expect(usecase).toBeDefined();
  });

  it('RatingArtistUsecase[Customer Is Not Related To Event] should throw DomainUnProcessableEntity(USER_IS_NOT_RELATED_TO_EVENT)', async () => {
    jest
      .spyOn(agendaProvider, 'artistAgendaAndEventRelatedToCustomer')
      .mockImplementation(() => Promise.resolve(null));
    try {
      await usecase.execute(1, 1, 1, { displayName: 'test' });
    } catch (error) {
      expect(error).toEqual(
        new DomainUnProcessableEntity(USER_IS_NOT_RELATED_TO_EVENT),
      );
    }
  });

  it('RatingArtistUsecase[Event Is Not Done] should throw DomainUnProcessableEntity(EVENT_NEEDS_TO_BE_DONE_TO_RATE)', async () => {
    const notDoneAgendaEvent: Agenda = {
      id: 1,
      artistId: 1,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      open: true,
      public: true,
      workingDays: [],
      agendaEvent: {
        id: 1,
        done: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        end: new Date(),
        start: new Date(),
        color: 'test',
        title: 'test',
        customerId: 1,
        agenda: null,
        notification: true,
        info: 'test',
      },
    };

    jest
      .spyOn(agendaProvider, 'artistAgendaAndEventRelatedToCustomer')
      .mockImplementation(() => Promise.resolve(notDoneAgendaEvent));
    try {
      await usecase.execute(1, 1, 1, { displayName: 'test' });
    } catch (error) {
      expect(error).toEqual(
        new DomainUnProcessableEntity(USER_IS_NOT_RELATED_TO_EVENT),
      );
    }
  });

  it('RatingArtistUsecase[Empty Rate & User Rated Before] should response OK', async () => {
    const doneAgendaEvent: Agenda = {
      id: 1,
      artistId: 1,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      open: true,
      public: true,
      workingDays: [],
      agendaEvent: {
        id: 1,
        done: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        end: new Date(),
        start: new Date(),
        color: 'test',
        title: 'test',
        customerId: 1,
        agenda: null,
        notification: true,
        info: 'test',
      },
    };

    jest
      .spyOn(agendaProvider, 'artistAgendaAndEventRelatedToCustomer')
      .mockImplementation(() => Promise.resolve(doneAgendaEvent));

    const customerReview: Review = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      eventId: 1,
      artistId: 1,
      value: 0,
      createBy: 1,
      header: 'test',
      content: 'test',
      isRated: true,
      displayName: 'test',
    };

    jest
      .spyOn(reviewProvider, 'findIfCustomerAlreadyReviewTheEvent')
      .mockImplementation(() => Promise.resolve(customerReview));

    const result = await usecase.execute(1, 1, 1, { displayName: 'test' });

    expect(result).toEqual(DefaultResponse.ok);
  });

  it('RatingArtistUsecase[Empty Rate & User Did Not Rate Before] should response Review created', async () => {
    const doneAgendaEvent: Agenda = {
      id: 1,
      artistId: 1,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      open: true,
      public: true,
      workingDays: [],
      agendaEvent: {
        id: 1,
        done: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        end: new Date(),
        start: new Date(),
        color: 'test',
        title: 'test',
        customerId: 1,
        agenda: null,
        notification: true,
        info: 'test',
      },
    };

    jest
      .spyOn(agendaProvider, 'artistAgendaAndEventRelatedToCustomer')
      .mockImplementation(() => Promise.resolve(doneAgendaEvent));

    jest
      .spyOn(reviewProvider, 'findIfCustomerAlreadyReviewTheEvent')
      .mockImplementation(() => Promise.resolve(undefined));

    jest
      .spyOn(reviewProvider, 'insertEmptyReview')
      .mockImplementation(() => Promise.resolve(void 0));

    const result = await usecase.execute(1, 1, 1, { displayName: 'test' });

    expect(result).toEqual({
      status: DefaultResponseStatus.CREATED,
      data: 'Review created',
    });
  });

  it('RatingArtistUsecase[Empty Rate & User Rate Before But Empty] should response Review created', async () => {
    const doneAgendaEvent: Agenda = {
      id: 1,
      artistId: 1,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      open: true,
      public: true,
      workingDays: [],
      agendaEvent: {
        id: 1,
        done: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        end: new Date(),
        start: new Date(),
        color: 'test',
        title: 'test',
        customerId: 1,
        agenda: null,
        notification: true,
        info: 'test',
      },
    };

    jest
      .spyOn(agendaProvider, 'artistAgendaAndEventRelatedToCustomer')
      .mockImplementation(() => Promise.resolve(doneAgendaEvent));

    const customerReview: Review = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      eventId: 1,
      artistId: 1,
      createBy: 1,
      isRated: false,
      displayName: 'test',
    };

    jest
      .spyOn(reviewProvider, 'findIfCustomerAlreadyReviewTheEvent')
      .mockImplementation(() => Promise.resolve(customerReview));

    jest
      .spyOn(reviewProvider, 'insertEmptyReview')
      .mockImplementation(() => void 0);

    const result = await usecase.execute(1, 1, 1, { displayName: 'test' });

    expect(result).toEqual({
      status: DefaultResponseStatus.CREATED,
      data: 'Review created',
    });
  });

  it('RatingArtistUsecase[Rate & User Did Rate Before] should throw DomainUnProcessableEntity(USER_ALREADY_REVIEW_THE_EVENT)', async () => {
    const doneAgendaEvent: Agenda = {
      id: 1,
      artistId: 1,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      open: true,
      public: true,
      workingDays: [],
      agendaEvent: {
        id: 1,
        done: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        end: new Date(),
        start: new Date(),
        color: 'test',
        title: 'test',
        customerId: 1,
        agenda: null,
        notification: true,
        info: 'test',
      },
    };

    jest
      .spyOn(agendaProvider, 'artistAgendaAndEventRelatedToCustomer')
      .mockImplementation(() => Promise.resolve(doneAgendaEvent));

    const customerReview: Review = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      eventId: 1,
      artistId: 1,
      createBy: 1,
      isRated: true,
      displayName: 'test',
    };

    jest
      .spyOn(reviewProvider, 'findIfCustomerAlreadyReviewTheEvent')
      .mockImplementation(() => Promise.resolve(customerReview));

    try {
      await usecase.execute(1, 1, 1, {
        displayName: 'test',
        comment: 'test',
      });
    } catch (error) {
      expect(error).toEqual(
        new DomainUnProcessableEntity(USER_ALREADY_REVIEW_THE_EVENT),
      );
    }
  });

  it('RatingArtistUsecase[Rate & User Did Rate Before] should create a new review', async () => {
    const doneAgendaEvent: Agenda = {
      id: 1,
      artistId: 1,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      open: true,
      public: true,
      workingDays: [],
      agendaEvent: {
        id: 1,
        done: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        end: new Date(),
        start: new Date(),
        color: 'test',
        title: 'test',
        customerId: 1,
        agenda: null,
        notification: true,
        info: 'test',
      },
    };

    jest
      .spyOn(agendaProvider, 'artistAgendaAndEventRelatedToCustomer')
      .mockImplementation(() => Promise.resolve(doneAgendaEvent));

    jest
      .spyOn(reviewProvider, 'findIfCustomerAlreadyReviewTheEvent')
      .mockImplementation(() => Promise.resolve(undefined));

    jest
      .spyOn(reviewProvider, 'hasReviews')
      .mockImplementation(() => Promise.resolve(false));

    try {
      await usecase.execute(1, 1, 1, {
        displayName: 'test',
        comment: 'test',
      });
    } catch (error) {
      expect(error).toEqual(
        new DomainUnProcessableEntity(USER_ALREADY_REVIEW_THE_EVENT),
      );
    }
  });
});
