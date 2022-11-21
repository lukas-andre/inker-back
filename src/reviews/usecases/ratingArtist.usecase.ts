import { Injectable } from '@nestjs/common';

import {
  DomainBadRule,
  DomainUnProcessableEntity,
} from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import {
  DefaultResponseDto,
  DefaultResponseStatus,
} from '../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../global/infrastructure/helpers/defaultResponse.helper';
import { Review } from '../database/entities/review.entity';
import {
  defaultRatingMap,
  ReviewAvg,
} from '../database/entities/reviewAvg.entity';
import { ReviewProvider } from '../database/providers/review.provider';
import { ReviewArtistRequestDto } from '../dtos/reviewArtistRequest.dto';

@Injectable()
export class RatingArtistUsecase extends BaseUseCase implements UseCase {
  constructor(private readonly reviewProvider: ReviewProvider) {
    super(RatingArtistUsecase.name);
  }

  async execute(
    artistId: number,
    eventId: number,
    userId: number,
    body: ReviewArtistRequestDto,
  ): Promise<DefaultResponseDto> {
    const userMadeComment = body.comment && body.comment.length > 0;

    if (!userMadeComment) {
      return this.emptyReviewFlow(artistId, eventId, userId, body);
    }

    if (!body.rating) {
      throw new DomainBadRule('Rating is required');
    }

    const review = await this.reviewProvider.repo.findOne({
      where: {
        createBy: userId,
      },
    });

    let transactionIsOk = false;

    if (review && review.isRated) {
      throw new DomainUnProcessableEntity('User already rated this artist');
    }

    if (!review) {
      transactionIsOk = await this.createReview(
        body,
        artistId,
        eventId,
        userId,
      );
    } else {
      transactionIsOk = await this.updateReview(
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

  private async createReview(
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

      const reviewAvg = await queryRunner.manager.findOne(ReviewAvg, {
        where: {
          artistId: artistId,
        },
      });

      if (!reviewAvg) {
        const ratingDetail = defaultRatingMap;
        ratingDetail[body.rating] = ratingDetail[body.rating] + 1;

        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(ReviewAvg)
          .values({
            artistId: artistId,
            value: body.rating,
            count: 1,
            eventId: eventId,
            detail: ratingDetail,
          })
          .execute();
      } else {
        const newRatingDetail = reviewAvg.detail;
        newRatingDetail[body.rating] = newRatingDetail[body.rating] + 1;

        const newCount = reviewAvg.count + 1;
        const newValue = (reviewAvg.value + body.rating) / newCount;

        await queryRunner.manager
          .createQueryBuilder()
          .update(ReviewAvg)
          .set({
            value: newValue,
            count: newCount,
            detail: newRatingDetail,
          })
          .where('artistId = :artistId', { artistId: artistId })
          .execute();
      }

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

  private async updateReview(
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
        .execute();

      const reviewAvg = await queryRunner.manager.findOne(ReviewAvg, {
        where: {
          artistId: artistId,
        },
      });

      if (!reviewAvg) {
        const newRatingDetail = defaultRatingMap;
        newRatingDetail[body.rating] = newRatingDetail[body.rating] + 1;

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
      } else {
        const newRatingDetail = reviewAvg.detail;
        newRatingDetail[body.rating] = newRatingDetail[body.rating] + 1;

        const newCount = reviewAvg.count + 1;
        const newValue = (reviewAvg.value + body.rating) / newCount;

        await queryRunner.manager
          .createQueryBuilder()
          .update(ReviewAvg)
          .set({
            value: newValue,
            count: newCount,
            detail: newRatingDetail,
          })
          .where('artistId = :artistId', { artistId: artistId })
          .execute();
      }

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

  private async emptyReviewFlow(
    artistId: number,
    eventId: number,
    userId: number,
    body: ReviewArtistRequestDto,
  ): Promise<DefaultResponseDto> {
    // Enhance: This is a temporary solution, we need to find a better way to handle this
    // hint: improve the query to just check if the user has a review
    const userRateThisEventBefore = await this.reviewProvider.repo.findOne({
      where: {
        createBy: userId,
      },
    });

    if (userRateThisEventBefore) {
      return DefaultResponse.ok;
    }

    try {
      await this.reviewProvider.repo
        .createQueryBuilder()
        .insert()
        .into(Review)
        .values({
          artistId: artistId,
          eventId: eventId,
          createBy: userId,
          displayName: body.displayName,
          isRated: false,
        })
        .execute();
      return { status: DefaultResponseStatus.CREATED, data: 'Review created' };
    } catch (error) {
      this.logger.error(error);
      throw new DomainUnProcessableEntity('Error saving review');
    }
  }
}
