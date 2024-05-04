import { Injectable } from '@nestjs/common';
import {
  InjectDataSource,
  InjectEntityManager,
  InjectRepository,
} from '@nestjs/typeorm';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { O } from 'ts-toolbelt';
import {
  DataSource,
  EntityManager,
  In,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import { REVIEW_DB_CONNECTION_NAME } from '../../../databases/constants';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import {
  DBServiceFindException,
  DBServiceFindOneException,
  DBServiceSaveException,
} from '../../../global/infrastructure/exceptions/dbService.exception';
import { ReviewReactionEnum } from '../../../reactions/domain/enums/reviewReaction.enum';
import {
  ERROR_INSERTING_EMPTY_REVIEW,
  FAILED_TO_EXECUTE_IS_REVIEW_RATED_QUERY,
  PROBLEMS_FINDING_IF_USER_REVIEW_THE_EVENT,
  REVIEW_AVG_MUST_EXISTS_TO_UPDATE,
  REVIEW_MUST_EXISTS_TO_UPDATE,
} from '../../codes';
import { ReviewArtistRequestDto } from '../../dtos/reviewArtistRequest.dto';
import { ReviewReactionsDetail } from '../../interfaces/review.interface';
import {
  RatingRate,
  defaultRatingMap,
} from '../../interfaces/reviewAvg.interface';
import { Review } from '../entities/review.entity';
import { ReviewAvg } from '../entities/reviewAvg.entity';

import { CustomerReviewReactionDetailsResult } from './reviewReaction.provider';
export type FindIfCustomerAlreadyReviewTheEventResult = Pick<
  Review,
  'id' | 'isRated'
>;

export type FindByArtistIdsResult = O.Omit<Review, 'updatedAt'> & {
  customerReactionDetail?: CustomerReviewReactionDetailsResult;
};

export interface QueryRunnerInterface {
  startTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  connect(): Promise<void>;
  manager: EntityManager;
  release(): Promise<void>;
  query: QueryRunner['query'];
}

export class QueryRunnerFactory {
  public static create(dataSource: DataSource): QueryRunnerInterface {
    return dataSource.createQueryRunner();
  }
}

export type ReviewPaginateOrderFilter = 'default' | 'mostRated' | 'mostRecent';
export type ReviewPaginateRateFilter = 'default' | '1' | '2' | '3' | '4' | '5';

function createBaseReviewQueryBuilder(
  repository: Repository<Review>,
  artistId: number | number[],
) {
  const queryBuilder = repository
    .createQueryBuilder('review')
    .select([
      'review.id',
      'review.artistId',
      'review.content',
      'review.createdBy',
      'review.header',
      'review.displayName',
      'review.isRated',
      'review.reviewReactions',
      'review.value',
      'review.eventId',
      'review.createdAt',
    ]);

  if (Array.isArray(artistId)) {
    queryBuilder.where('review.artistId IN (:...artistIds)', {
      artistIds: artistId,
    });
  } else {
    queryBuilder.where('review.artistId = :artistId', { artistId });
  }

  return queryBuilder;
}

function applyDefaultOrder(queryBuilder: SelectQueryBuilder<Review>): void {
  queryBuilder.orderBy({
    'review.isRated': 'DESC',
    'review.value': 'DESC',
    'review.createdAt': 'DESC',
  });
}

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

  async findByEventIds(eventsIds: number[]) {
    try {
      return await this.repository.find({
        where: {
          eventId: In(eventsIds),
        },
      });
    } catch (error) {
      throw new DBServiceFindException(this, this.findByEventIds.name, error);
    }
  }

  async paginate(
    artistId: number,
    options: IPaginationOptions,
    orderFilter: ReviewPaginateOrderFilter = 'default',
    rateFilter: ReviewPaginateRateFilter = 'default',
  ): Promise<Pagination<Review>> {
    try {
      const queryBuilder = createBaseReviewQueryBuilder(
        this.repository,
        artistId,
      );

      switch (orderFilter) {
        case 'mostRated':
          queryBuilder.orderBy('review.isRated', 'DESC');
          break;
        case 'mostRecent':
          queryBuilder.orderBy('review.createdAt', 'DESC');
          break;
        default:
          applyDefaultOrder(queryBuilder);
          break;
      }

      if (rateFilter !== 'default') {
        queryBuilder.andWhere('review.value = :value', { value: rateFilter });
      }

      return await paginate<Review>(queryBuilder, options);
    } catch (error) {
      throw new DBServiceFindException(this, this.paginate.name, error);
    }
  }

  async findByArtistIds(artistId: number[]): Promise<FindByArtistIdsResult[]> {
    const result: FindByArtistIdsResult[] = [];

    try {
      for (const id of artistId) {
        if (!id) {
          throw new Error(ERROR_INSERTING_EMPTY_REVIEW);
        }

        const queryBuilder = createBaseReviewQueryBuilder(this.repository, id);

        applyDefaultOrder(queryBuilder);

        const queryResult = (await queryBuilder
          .take(3)
          .getMany()) as FindByArtistIdsResult[];

        result.push(...queryResult);
      }

      return result;
    } catch (error) {
      throw new DBServiceFindOneException(
        this,
        this.findByArtistIds.name,
        error,
      );
    }
  }

  async updateReviewReactionTransaction(
    currentReaction: ReviewReactionEnum,
    reviewId: number,
    userId: number,
    reaction: ReviewReactionEnum,
  ): Promise<boolean> {
    let transactionIsOK = false;

    const queryRunner = QueryRunnerFactory.create(this.dataSource);

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.query(
        `UPDATE review_reaction SET reaction_type = $1 WHERE review_id = $2 AND customer_id = $3`,
        [reaction, reviewId, userId],
      );

      const [{ detail }]: { detail: ReviewReactionsDetail }[] =
        await queryRunner.manager.query(
          `SELECT review_reactions AS detail FROM review WHERE id = $1`,
          [reviewId],
        );

      if (reaction !== ReviewReactionEnum.off) {
        detail[reaction + 's'] += 1;

        if (currentReaction !== ReviewReactionEnum.off) {
          detail[currentReaction + 's'] -= 1;
        }
      }

      await queryRunner.manager.query(
        `UPDATE review SET review_reactions = $1 WHERE id = $2`,
        [detail, reviewId],
      );

      await queryRunner.commitTransaction();

      transactionIsOK = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return transactionIsOK;
  }

  async offReviewReactionTransaction(
    currentReaction: ReviewReactionEnum,
    reviewId: number,
    userId: number,
  ): Promise<boolean> {
    let transactionIsOK = false;

    const queryRunner = QueryRunnerFactory.create(this.dataSource);

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.query(
        `UPDATE review_reaction SET reaction_type = $1 WHERE review_id = $2 AND customer_id = $3`,
        [ReviewReactionEnum.off, reviewId, userId],
      );

      const [{ detail }]: { detail: ReviewReactionsDetail }[] =
        await queryRunner.manager.query(
          `SELECT review_reactions AS detail FROM review WHERE id = $1`,
          [reviewId],
        );

      detail[currentReaction + 's'] -= 1;

      await queryRunner.manager.query(
        `UPDATE review SET review_reactions = $1 WHERE id = $2`,
        [detail, reviewId],
      );

      await queryRunner.commitTransaction();

      transactionIsOK = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return transactionIsOK;
  }

  async insertReviewReactionTransaction(
    reviewId: number,
    customerId: number,
    reviewReaction: ReviewReactionEnum,
  ): Promise<boolean> {
    let transactionIsOK = false;

    const queryRunner = QueryRunnerFactory.create(this.dataSource);

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.query(
        `INSERT INTO review_reaction (review_id, customer_id, reaction_type) VALUES ($1, $2, $3)`,
        [reviewId, customerId, reviewReaction],
      );

      const [{ detail }]: { detail: ReviewReactionsDetail }[] =
        await queryRunner.manager.query(
          `SELECT review_reactions AS detail FROM review WHERE id = $1`,
          [reviewId],
        );

      if (reviewReaction !== ReviewReactionEnum.off) {
        detail[reviewReaction + 's'] += 1;
      }

      await queryRunner.manager.query(
        `UPDATE review SET review_reactions = $1 WHERE id = $2`,
        [detail, reviewId],
      );

      await queryRunner.commitTransaction();

      transactionIsOK = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return transactionIsOK;
  }

  async isReviewRated(reviewId: number): Promise<boolean | undefined> {
    try {
      const review = await this.repository
        .createQueryBuilder('review')
        .select('review.isRated', 'isRated')
        .where('review.id = :reviewId', { reviewId })
        .getRawOne<FindIfCustomerAlreadyReviewTheEventResult>();
      return review ? review.isRated : undefined;
    } catch (error) {
      throw new DBServiceFindOneException(
        this,
        FAILED_TO_EXECUTE_IS_REVIEW_RATED_QUERY,
        error,
      );
    }
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
    let transactionIsOK = false;

    const queryRunner = QueryRunnerFactory.create(this.dataSource);

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

      transactionIsOK = true;
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return transactionIsOK;
  }

  async updateReviewTransaction(
    artistId: number,
    eventId: number,
    userId: number,
    updateData: ReviewArtistRequestDto,
  ): Promise<boolean> {
    let transactionIsOK = false;

    const queryRunner = QueryRunnerFactory.create(this.dataSource);

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

      transactionIsOK = true;
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return transactionIsOK;
  }

  private async updateReviewAvgTransaction(
    queryRunner: QueryRunnerInterface,
    artistId: number,
    body: ReviewArtistRequestDto,
    oldReviewValue: number,
  ): Promise<void> {
    const [reviewAvg]: Pick<ReviewAvg, 'detail'>[] = await queryRunner.query(
      `SELECT detail FROM review_avg WHERE artist_id = $1 LIMIT 1`,
      [artistId],
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
    queryRunner: QueryRunnerInterface,
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
    queryRunner: QueryRunnerInterface,
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
    queryRunner: QueryRunnerInterface,
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
