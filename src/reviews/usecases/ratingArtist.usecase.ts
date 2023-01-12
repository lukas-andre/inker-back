import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm/query-runner/QueryRunner';

import { AgendaProvider } from '../../agenda/infrastructure/providers/agenda.provider';
import { DomainUnProcessableEntity } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import {
  DefaultResponseDto,
  DefaultResponseStatus,
} from '../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../global/infrastructure/helpers/defaultResponse.helper';
import {
  EVENT_NEEDS_TO_BE_DONE_TO_RATE,
  USER_IS_NOT_RELATED_TO_EVENT,
} from '../../users/domain/errors/codes';
import { USER_ALREADY_REVIEW_THE_EVENT } from '../codes';
import { Review } from '../database/entities/review.entity';
import {
  defaultRatingMap,
  RatingRate,
  ReviewAvg,
} from '../database/entities/reviewAvg.entity';
import { ReviewProvider } from '../database/providers/review.provider';
import { ReviewArtistRequestDto } from '../dtos/reviewArtistRequest.dto';

@Injectable()
export class RatingArtistUsecase extends BaseUseCase implements UseCase {
  constructor(
    private readonly reviewProvider: ReviewProvider,
    private readonly agendaProvider: AgendaProvider,
  ) {
    super(RatingArtistUsecase.name);
  }

  async execute(
    artistId: number,
    eventId: number,
    userId: number,
    body: ReviewArtistRequestDto,
  ): Promise<DefaultResponseDto> {
    const artistAgendaAndEventRelatedToCustomer =
      await this.agendaProvider.artistAgendaAndEventRelatedToCustomer(
        artistId,
        eventId,
        userId,
      );

    if (!artistAgendaAndEventRelatedToCustomer) {
      throw new DomainUnProcessableEntity(USER_IS_NOT_RELATED_TO_EVENT);
    }

    const isEventDone = artistAgendaAndEventRelatedToCustomer.agendaEvent.done;

    if (!isEventDone) {
      throw new DomainUnProcessableEntity(EVENT_NEEDS_TO_BE_DONE_TO_RATE);
    }

    if (this.isUserNotReviewIt(body)) {
      return this.emptyReviewFlow(artistId, eventId, userId, body);
    }

    const review =
      await this.reviewProvider.findIfCustomerAlreadyReviewTheEvent(
        userId,
        eventId,
        artistId,
      );

    if (review && review.isRated) {
      throw new DomainUnProcessableEntity(USER_ALREADY_REVIEW_THE_EVENT);
    }

    let transactionIsOk = false;

    if (!review) {
      // Create new review when we have body.comment and body.rating and the user is not rated yet
      transactionIsOk = await this.createReviewTransact(
        body,
        artistId,
        eventId,
        userId,
      );
    } else {
      // This if for uncomment reviews
      transactionIsOk = await this.updateReviewTransact(
        body,
        artistId,
        eventId,
        userId,
      );
    }

    if (!transactionIsOk) {
      throw new DomainUnProcessableEntity('Error on rating artist');
    }

    return {
      status: DefaultResponseStatus.CREATED,
      data: 'Artist rated successfully',
    };
  }

  private async createReviewTransact(
    body: ReviewArtistRequestDto,
    artistId: number,
    eventId: number,
    userId: number,
  ): Promise<boolean> {
    let transactionIsOk = false;
    const queryRunner = this.reviewProvider.source.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      await queryRunner.connect();

      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Review)
        .values({
          value: body.rating,
          artistId: artistId,
          eventId: eventId,
          createBy: userId,
          displayName: body.displayName,
          header: body.header,
          content: body.comment,
          isRated: true,
        })
        .execute();

      await this.handleReviewAvg(queryRunner, artistId, body, eventId);

      await queryRunner.commitTransaction();

      transactionIsOk = true;
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return transactionIsOk;
  }

  private async updateReviewTransact(
    body: ReviewArtistRequestDto,
    artistId: number,
    eventId: number,
    userId: number,
  ): Promise<boolean> {
    let transactionIsOk = false;
    const queryRunner = this.reviewProvider.source.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      await queryRunner.connect();

      await queryRunner.manager
        .createQueryBuilder()
        .update(Review)
        .set({
          content: body.comment,
          value: body.rating,
          isRated: true,
        })
        .where('createBy = :createBy', { createBy: userId })
        .andWhere('artistId = :artistId', { artistId: artistId })
        .andWhere('eventId = :eventId', { eventId: eventId })
        .execute();

      await this.handleReviewAvg(queryRunner, artistId, body, eventId);

      await queryRunner.commitTransaction();

      transactionIsOk = true;
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return transactionIsOk;
  }

  private async handleReviewAvg(
    queryRunner: QueryRunner,
    artistId: number,
    body: ReviewArtistRequestDto,
    eventId: number,
  ): Promise<void> {
    const reviewAvg = await queryRunner.manager.findOne(ReviewAvg, {
      where: {
        artistId: artistId,
        eventId: eventId,
      },
    });

    if (!reviewAvg) {
      await this.newReviewAvgTransact(queryRunner, body, artistId, eventId);
    } else {
      await this.updateReviewAvgTransact(
        queryRunner,
        body,
        reviewAvg,
        artistId,
        eventId,
      );
    }
  }

  private async updateReviewAvgTransact(
    queryRunner: QueryRunner,
    body: ReviewArtistRequestDto,
    reviewAvg: ReviewAvg,
    artistId: number,
    eventId: number,
  ): Promise<void> {
    const { newAvg, newCount, newDetail } = await this.getUpdateReviewAvgValues(
      reviewAvg,
      body.rating,
    );

    await queryRunner.manager
      .createQueryBuilder()
      .update(ReviewAvg)
      .set({
        value: newAvg,
        count: newCount,
        detail: newDetail,
      })
      .where('artistId = :artistId', { artistId: artistId })
      .andWhere('eventId = :eventId', { eventId: eventId })
      .execute();
  }

  private async newReviewAvgTransact(
    queryRunner: QueryRunner,
    body: ReviewArtistRequestDto,
    artistId: number,
    eventId: number,
  ): Promise<void> {
    const newRatingDetail = this.getNewRatingDetail(body);

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(ReviewAvg)
      .values({
        artistId: artistId,
        value: body.rating,
        count: 1,
        eventId: eventId,
        detail: newRatingDetail,
      })
      .execute();
  }

  private isUserNotReviewIt(body: ReviewArtistRequestDto): boolean {
    // We need to check if the user is not making a review and just leave a rating
    return !body.comment && !body.rating;
  }

  private computeNewAvg(
    oldRatingAvg: number,
    newCount: number,
    newRating: number,
  ): number {
    // https://math.stackexchange.com/questions/106313/regular-average-calculated-accumulatively#:~:text=i.e.%20to%20calculate%20the%20new,divide%20the%20total%20by%20n.
    return oldRatingAvg + (newRating - oldRatingAvg) / newCount;
  }

  private getNewRatingDetail(
    body: ReviewArtistRequestDto,
  ): Record<RatingRate, number> {
    const newRatingDetail = defaultRatingMap;
    newRatingDetail[body.rating] = newRatingDetail[body.rating] + 1;
    return newRatingDetail;
  }

  private async getUpdateReviewAvgValues(
    oldReviewAvg: ReviewAvg,
    newRating: number,
  ): Promise<{
    newAvg: number;
    newCount: number;
    newDetail: Record<RatingRate, number>;
  }> {
    const { detail, value, count } = oldReviewAvg;

    detail[newRating] = detail[newRating] + 1;

    const newCount = count + 1;
    const newAvg = this.computeNewAvg(value, newCount, newRating);

    return {
      newAvg,
      newCount,
      newDetail: detail,
    };
  }

  private async emptyReviewFlow(
    artistId: number,
    eventId: number,
    userId: number,
    body: ReviewArtistRequestDto,
  ): Promise<DefaultResponseDto> {
    const customerReview =
      await this.reviewProvider.findIfCustomerAlreadyReviewTheEvent(
        userId,
        eventId,
        artistId,
      );

    if (customerReview && customerReview.isRated) {
      return DefaultResponse.ok;
    }

    return this.reviewProvider.insertEmptyReview(
      artistId,
      eventId,
      userId,
      body.displayName,
    );
  }
}
