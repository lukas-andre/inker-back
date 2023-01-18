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
import {
  ERROR_INSERTING_EMPTY_REVIEW,
  PROBLEMS_FINDING_IF_USER_REVIEW_THE_EVENT,
  REVIEW_AVG_MUST_EXISTS_TO_UPDATE,
  REVIEW_MUST_EXISTS_TO_UPDATE,
} from '../../codes';
import { ReviewArtistRequestDto } from '../../dtos/reviewArtistRequest.dto';
import { Review } from '../entities/review.entity';
import {
  defaultRatingMap,
  RatingRate,
  ReviewAvg,
} from '../entities/reviewAvg.entity';

export type FindIfCustomerAlreadyReviewTheEventResult = Pick<
  Review,
  'id' | 'isRated'
>;

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
  ): Promise<FindIfCustomerAlreadyReviewTheEventResult> {
    try {
      return await this.repository
        .createQueryBuilder('review')
        .select('review.id', 'id')
        .addSelect('review.isRated', 'isRated')
        .where('review.createdBy = :customerId', { customerId })
        .andWhere('review.eventId = :eventId', { eventId })
        .andWhere('review.artistId = :artistId', { artistId })
        .getRawOne<FindIfCustomerAlreadyReviewTheEventResult>();
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
          createdBy: createdBy,
          displayName: displayName,
          isRated: false,
        })
        .execute();
    } catch (error) {
      throw new DBServiceSaveException(
        this,
        ERROR_INSERTING_EMPTY_REVIEW,
        error,
      );
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
          createdBy: userId,
          displayName: reviewData.displayName,
          header: reviewData.header,
          content: reviewData.comment,
          isRated: true,
        })
        .execute();

      await this.handleReviewAvg(queryRunner, artistId, reviewData);

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

      const oldReviewValue = await queryRunner.manager
        .createQueryBuilder()
        .select('value')
        .from(Review, 'review')
        .where('created_by = :createdBy', { createdBy: userId })
        .andWhere('artist_id = :artistId', { artistId: artistId })
        .andWhere('event_id = :eventId', { eventId: eventId })
        .getRawOne<{ value: number }>();

      if (!oldReviewValue) {
        throw new DBServiceFindOneException(this, REVIEW_MUST_EXISTS_TO_UPDATE);
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Review)
        .set({
          content: updateData.comment,
          value: updateData.rating,
          isRated: true,
        })
        .where('createdBy = :createdBy', { createdBy: userId })
        .andWhere('artistId = :artistId', { artistId: artistId })
        .andWhere('eventId = :eventId', { eventId: eventId })
        .execute();

      await this.updateReviewAvgTransaction(
        queryRunner,
        artistId,
        updateData,
        oldReviewValue.value,
      );

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

  private async updateReviewAvgTransaction(
    queryRunner: QueryRunner,
    artistId: number,
    body: ReviewArtistRequestDto,
    oldReviewValue: number,
  ): Promise<void> {
    const reviewAvg = await this.findReviewAvgTransaction(
      queryRunner,
      artistId,
    );

    if (!reviewAvg) {
      throw new DBServiceFindOneException(
        this,
        REVIEW_AVG_MUST_EXISTS_TO_UPDATE,
      );
    }

    const detailToUpdate = this.getDetailToUpdate(
      reviewAvg.detail,
      body.rating,
      oldReviewValue,
    );
    const avgToUpdate = this.getAvgToUpdate(detailToUpdate);

    await queryRunner.manager
      .createQueryBuilder()
      .update(ReviewAvg)
      .set({
        value: avgToUpdate,
        detail: detailToUpdate,
      })
      .where('artistId = :artistId', { artistId: artistId })
      .execute();
  }

  async findReviewAvgTransaction(queryRunner: QueryRunner, artistId: number) {
    return await queryRunner.manager.findOne(ReviewAvg, {
      where: {
        artistId: artistId,
      },
    });
  }

  private getDetailToUpdate(
    detail: Record<RatingRate, number>,
    newRating: RatingRate,
    oldReviewValue: number,
  ): Record<RatingRate, number> {
    const newDetail = { ...detail };

    newDetail[oldReviewValue] = newDetail[oldReviewValue] - 1;
    newDetail[newRating] = newDetail[newRating] + 1;

    return newDetail;
  }

  private getAvgToUpdate(newDetail: Record<RatingRate, number>): number {
    let sum = 0;
    let count = 0;
    for (const key in newDetail) {
      const value = newDetail[key];
      sum += Number(key) * value;
      count += value;
    }
    return sum / count;
  }

  private async handleReviewAvg(
    queryRunner: QueryRunner,
    artistId: number,
    body: ReviewArtistRequestDto,
  ): Promise<void> {
    const reviewAvg = await queryRunner.manager.findOne(ReviewAvg, {
      where: {
        artistId: artistId,
      },
    });

    if (!reviewAvg) {
      await this.newReviewAvgTransact(queryRunner, body, artistId);
    } else {
      await this.updateReviewAvgTransact(
        queryRunner,
        body,
        reviewAvg,
        artistId,
      );
    }
  }

  private async newReviewAvgTransact(
    queryRunner: QueryRunner,
    body: ReviewArtistRequestDto,
    artistId: number,
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
        detail: newRatingDetail,
      })
      .execute();
  }

  private getNewRatingDetail(
    body: ReviewArtistRequestDto,
  ): Record<RatingRate, number> {
    const newRatingDetail = { ...defaultRatingMap };
    newRatingDetail[body.rating] = newRatingDetail[body.rating] + 1;
    return newRatingDetail;
  }

  private async updateReviewAvgTransact(
    queryRunner: QueryRunner,
    body: ReviewArtistRequestDto,
    reviewAvg: ReviewAvg,
    artistId: number,
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
