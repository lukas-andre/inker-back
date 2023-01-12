import { Injectable } from '@nestjs/common';
import {
  InjectDataSource,
  InjectEntityManager,
  InjectRepository,
} from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { REVIEW_DB_CONNECTION_NAME } from '../../../databases/constants';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { DomainUnProcessableEntity } from '../../../global/domain/exceptions/domain.exception';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import { DefaultResponseStatus } from '../../../global/infrastructure/dtos/defaultResponse.dto';
import { DBServiceFindOneException } from '../../../global/infrastructure/exceptions/dbService.exception';
import { PROBLEMS_FINDING_IF_USER_REVIEW_THE_EVENT } from '../../codes';
import { Review } from '../entities/review.entity';

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
      return { status: DefaultResponseStatus.CREATED, data: 'Review created' };
    } catch (error) {
      this.logger.error(error);
      throw new DomainUnProcessableEntity('Error saving review');
    }
  }
}
