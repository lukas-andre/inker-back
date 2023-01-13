import { Injectable } from '@nestjs/common';
import {
  InjectDataSource,
  InjectEntityManager,
  InjectRepository,
} from '@nestjs/typeorm';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';

import { REVIEW_DB_CONNECTION_NAME } from '../../../databases/constants';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import {
  DBServiceFindOneException,
  DBServiceSaveException,
} from '../../../global/infrastructure/exceptions/dbService.exception';
import { PROBLEMS_FINDING_IF_USER_REVIEW_THE_EVENT } from '../../codes';
import { ReviewArtistRequestDto } from '../../dtos/reviewArtistRequest.dto';
import { Review } from '../entities/review.entity';
import {
  defaultRatingMap,
  RatingRate,
  ReviewAvg,
} from '../entities/reviewAvg.entity';

@Injectable()
export class ReviewProvider extends BaseComponent {
  constructor(
    @InjectRepository(Review, REVIEW_DB_CONNECTION_NAME)
    private readonly repository: Repository<Review>,
    @InjectDataSource(REVIEW_DB_CONNECTION_NAME)
    private readonly dataSource: DataSource,
    @InjectEntityManager(REVIEW_DB_CONNECTION_NAME)
    private readonly entityManager: EntityManager,
  ) {
    super(ReviewProvider.name);
  }

  get source(): DataSource {
    return this.dataSource;
  }

  get manager(): EntityManager {
    return this.entityManager;
  }

  get repo(): Repository<Review> {
    return this.repository;
  }

  async findAll(params: number) {
    return params;
  }

  async exists(id: number): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.repository.query(
      `SELECT EXISTS(SELECT 1 FROM review a WHERE a.id = $1)`,
      [id],
    );

    return result.exists;
  }

  async findIfCustomerAlreadyReviewTheEvent(
    customerId: number,
    eventId: number,
    artistId: number,
  ): Promise<Review | undefined> {
    try {
      // await this.repository
      //   .createQueryBuilder('review')
      //   .select('review.id')
      //   .where('review.createBy = :customerId', { customerId })
      //   .andWhere('review.eventId = :eventId', { eventId })
      //   .andWhere('review.artistId = :artistId', { artistId })
      //   .getOne();

      return await this.repository.findOne({
        where: { createBy: customerId, eventId, artistId },
      });
    } catch (error) {
      throw new DBServiceFindOneException(
        this,
        PROBLEMS_FINDING_IF_USER_REVIEW_THE_EVENT,
        error,
      );
    }
  }

  async insertEmptyReview(
    artistId: number,
    eventId: number,
    createdBy: number,
    displayName: string,
  ) {
    try {
      await this.repository
        .createQueryBuilder()
        .insert()
        .into(Review)
        .values({
          artistId: artistId,
          eventId: eventId,
          createBy: createdBy,
          displayName: displayName,
          isRated: false,
        })
        .execute();
    } catch (error) {
      throw new DBServiceSaveException(this, 'Error saving review', error);
    }
  }

  async createReviewTransaction(
    artistId: number,
    eventId: number,
    userId: number,
    reviewData: ReviewArtistRequestDto,
  ) {
    let transactionIsOk = false;

    const queryRunner = this.source.createQueryRunner();

    await queryRunner.startTransaction();
    try {
      await queryRunner.connect();

      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Review)
        .values({
          value: reviewData.rating,
          artistId: artistId,
          eventId: eventId,
          createBy: userId,
          displayName: reviewData.displayName,
          header: reviewData.header,
          content: reviewData.comment,
          isRated: true,
        })
        .execute();

      await this.handleReviewAvg(queryRunner, artistId, reviewData, eventId);

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

  async updateReviewTransaction(
    artistId: number,
    eventId: number,
    userId: number,
    updateData: ReviewArtistRequestDto,
  ): Promise<boolean> {
    let transactionIsOk = false;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      await queryRunner.connect();

      await queryRunner.manager
        .createQueryBuilder()
        .update(Review)
        .set({
          content: updateData.comment,
          value: updateData.rating,
          isRated: true,
        })
        .where('createBy = :createBy', { createBy: userId })
        .andWhere('artistId = :artistId', { artistId: artistId })
        .andWhere('eventId = :eventId', { eventId: eventId })
        .execute();

      await this.handleReviewAvg(queryRunner, artistId, updateData, eventId);

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

  private getNewRatingDetail(
    body: ReviewArtistRequestDto,
  ): Record<RatingRate, number> {
    const newRatingDetail = defaultRatingMap;
    newRatingDetail[body.rating] = newRatingDetail[body.rating] + 1;
    return newRatingDetail;
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
  private computeNewAvg(
    oldRatingAvg: number,
    newCount: number,
    newRating: number,
  ): number {
    // https://math.stackexchange.com/questions/106313/regular-average-calculated-accumulatively#:~:text=i.e.%20to%20calculate%20the%20new,divide%20the%20total%20by%20n.
    return oldRatingAvg + (newRating - oldRatingAvg) / newCount;
  }
}
