import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';

import {
  AgendaRepository,
  ArtistAgendaAndEventRelatedToCustomerResult,
} from '../../../agenda/infrastructure/repositories/agenda.repository';
import { DomainUnProcessableEntity } from '../../../global/domain/exceptions/domain.exception';
import { DefaultResponseStatus } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../../global/infrastructure/helpers/defaultResponse.helper';
import {
  EVENT_NEEDS_TO_BE_DONE_TO_RATE,
  USER_IS_NOT_RELATED_TO_EVENT,
} from '../../../users/domain/errors/codes';
import { ERROR_CREATING_REVIEW } from '../../codes';
import {
  FindIfCustomerAlreadyReviewTheEventResult,
  ReviewRepository,
} from '../../database/repositories/review.repository';

import { RatingArtistUsecase } from '../ratingArtist.usecase';

describe('RatingArtistUsecase', () => {
  let usecase: RatingArtistUsecase;
  let reviewProvider: DeepMocked<ReviewRepository>;
  let agendaProvider: DeepMocked<AgendaRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RatingArtistUsecase,
        {
          provide: ReviewRepository,
          useValue: createMock<ReviewRepository>(),
        },
        {
          provide: AgendaRepository,
          useValue: createMock<AgendaRepository>(),
        },
      ],
    }).compile();

    usecase = module.get<RatingArtistUsecase>(RatingArtistUsecase);
    reviewProvider = module.get(ReviewRepository);
    agendaProvider = module.get(AgendaRepository);
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
    const notDoneAgendaEvent: ArtistAgendaAndEventRelatedToCustomerResult = {
      id: 1,
      eventIsDone: false,
    };

    jest
      .spyOn(agendaProvider, 'artistAgendaAndEventRelatedToCustomer')
      .mockImplementation(() => Promise.resolve(notDoneAgendaEvent));
    try {
      await usecase.execute(1, 1, 1, { displayName: 'test' });
    } catch (error) {
      expect(error).toEqual(
        new DomainUnProcessableEntity(EVENT_NEEDS_TO_BE_DONE_TO_RATE),
      );
    }
  });

  it('RatingArtistUsecase[Empty Rate & User Rated Before] should response OK', async () => {
    const doneAgendaEvent: ArtistAgendaAndEventRelatedToCustomerResult = {
      id: 1,
      eventIsDone: true,
    };

    jest
      .spyOn(agendaProvider, 'artistAgendaAndEventRelatedToCustomer')
      .mockImplementation(() => Promise.resolve(doneAgendaEvent));

    const customerReview: FindIfCustomerAlreadyReviewTheEventResult = {
      id: 1,
      isRated: true,
    };

    jest
      .spyOn(reviewProvider, 'findIfCustomerAlreadyReviewTheEvent')
      .mockImplementation(() => Promise.resolve(customerReview));

    const result = await usecase.execute(1, 1, 1, { displayName: 'test' });

    expect(result).toEqual(DefaultResponse.ok);
  });

  it('RatingArtistUsecase[Empty Rate & User Did Not Rate Before] should response Review created', async () => {
    const doneAgendaEvent: ArtistAgendaAndEventRelatedToCustomerResult = {
      id: 1,
      eventIsDone: true,
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
    const doneAgendaEvent: ArtistAgendaAndEventRelatedToCustomerResult = {
      id: 1,
      eventIsDone: true,
    };

    jest
      .spyOn(agendaProvider, 'artistAgendaAndEventRelatedToCustomer')
      .mockImplementation(() => Promise.resolve(doneAgendaEvent));

    const customerReview: FindIfCustomerAlreadyReviewTheEventResult = {
      id: 1,
      isRated: false,
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

  it('RatingArtistUsecase[Rate & User Did Not Rate Before] should create a new review', async () => {
    const doneAgendaEvent: ArtistAgendaAndEventRelatedToCustomerResult = {
      id: 1,
      eventIsDone: true,
    };

    jest
      .spyOn(agendaProvider, 'artistAgendaAndEventRelatedToCustomer')
      .mockImplementation(() => Promise.resolve(doneAgendaEvent));

    jest
      .spyOn(reviewProvider, 'findIfCustomerAlreadyReviewTheEvent')
      .mockImplementation(() => Promise.resolve(undefined));

    jest
      .spyOn(reviewProvider, 'createReviewTransaction')
      .mockImplementation(() => Promise.resolve(true));

    const result = await usecase.execute(1, 1, 1, {
      displayName: 'test',
      comment: 'test',
    });

    expect(result).toEqual({
      status: DefaultResponseStatus.CREATED,
      data: 'Artist rated successfully',
    });
  });

  it('RatingArtistUsecase[Rate & User Did Rate And Want To Update] should update review', async () => {
    const doneAgendaEvent: ArtistAgendaAndEventRelatedToCustomerResult = {
      id: 1,
      eventIsDone: true,
    };

    jest
      .spyOn(agendaProvider, 'artistAgendaAndEventRelatedToCustomer')
      .mockImplementation(() => Promise.resolve(doneAgendaEvent));

    const customerReview: FindIfCustomerAlreadyReviewTheEventResult = {
      id: 1,
      isRated: true,
    };

    jest
      .spyOn(reviewProvider, 'findIfCustomerAlreadyReviewTheEvent')
      .mockImplementation(() => Promise.resolve(customerReview));

    jest
      .spyOn(reviewProvider, 'updateReviewTransaction')
      .mockImplementation(() => Promise.resolve(true));

    const result = await usecase.execute(1, 1, 1, {
      displayName: 'test',
      comment: 'new comment',
    });

    expect(result).toEqual({
      status: DefaultResponseStatus.CREATED,
      data: 'Artist rated successfully',
    });
  });

  it('RatingArtistUsecase[Rate & User Did Not Rate Before] should throw new DomainUnProcessableEntity(ERROR_CREATING_REVIEW)', async () => {
    const doneAgendaEvent: ArtistAgendaAndEventRelatedToCustomerResult = {
      id: 1,
      eventIsDone: true,
    };

    jest
      .spyOn(agendaProvider, 'artistAgendaAndEventRelatedToCustomer')
      .mockImplementation(() => Promise.resolve(doneAgendaEvent));

    jest
      .spyOn(reviewProvider, 'findIfCustomerAlreadyReviewTheEvent')
      .mockImplementation(() => Promise.resolve(undefined));

    jest
      .spyOn(reviewProvider, 'createReviewTransaction')
      .mockImplementation(() => Promise.resolve(false));

    try {
      await usecase.execute(1, 1, 1, {
        displayName: 'test',
        comment: 'test',
      });
    } catch (error) {
      expect(error).toEqual(
        new DomainUnProcessableEntity(ERROR_CREATING_REVIEW),
      );
    }
  });

  it('RatingArtistUsecase[Rate & User Did Rate And Want To Update] should throw throw new DomainUnProcessableEntity(ERROR_CREATING_REVIEW)', async () => {
    const doneAgendaEvent: ArtistAgendaAndEventRelatedToCustomerResult = {
      id: 1,
      eventIsDone: true,
    };

    jest
      .spyOn(agendaProvider, 'artistAgendaAndEventRelatedToCustomer')
      .mockImplementation(() => Promise.resolve(doneAgendaEvent));

    const customerReview: FindIfCustomerAlreadyReviewTheEventResult = {
      id: 1,
      isRated: true,
    };

    jest
      .spyOn(reviewProvider, 'findIfCustomerAlreadyReviewTheEvent')
      .mockImplementation(() => Promise.resolve(customerReview));

    jest
      .spyOn(reviewProvider, 'updateReviewTransaction')
      .mockImplementation(() => Promise.resolve(false));

    try {
      await usecase.execute(1, 1, 1, {
        displayName: 'test',
        comment: 'test',
      });
    } catch (error) {
      expect(error).toEqual(
        new DomainUnProcessableEntity(ERROR_CREATING_REVIEW),
      );
    }
  });
});
