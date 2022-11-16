import { Injectable } from '@nestjs/common';

import { ArtistsDbService } from '../../artists/infrastructure/database/services/artistsDb.service';
import { DomainUnProcessableEntity } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import {
  DefaultResponseDto,
  DefaultResponseStatus,
} from '../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponseHelper } from '../../global/infrastructure/helpers/defaultResponse.helper';
import { Review } from '../database/entities/review.entity';
import { ReviewProvider } from '../database/providers/review.provider';
import { ReviewAvgProvider } from '../database/providers/reviewAvg.provider';
import { ReviewArtistRequestDto } from '../dtos/reviewArtistRequest.dto';

@Injectable()
export class RatingArtistUsecase extends BaseUseCase implements UseCase {
  constructor(
    private readonly artistDbService: ArtistsDbService,
    private readonly reviewProvider: ReviewProvider,
    private readonly reviewAgProvider: ReviewAvgProvider,
  ) {
    super(RatingArtistUsecase.name);
  }

  async execute(
    eventId: number,
    artistId: number,
    userId: number,
    body: ReviewArtistRequestDto,
  ) {
    const userMadeComment = body.comment && body.comment.length > 0;

    if (!userMadeComment) {
      return this.emptyReviewFlow(eventId, artistId, userId, body);
    }

    if (!body.rating) {
      throw new DomainUnProcessableEntity('Rating is required');
    }

    const previewReview = await this.reviewProvider.repo().findOne({
      where: {
        createBy: userId,
      },
    });

    if (previewReview.isRated == false) {
      // TODO: MOVE THIS TO TRANSACTION
      await this.reviewProvider
        .repo()
        .createQueryBuilder()
        .update()
        .set({
          value: body.rating,
          isRated: true,
          content: body.comment,
          header: body.header,
        })
        .where('createdBy = :createdBy', {
          createdBy: previewReview.createBy,
        })
        .execute();

      const reviewAvg = await this.reviewAgProvider.repo().findOne({
        where: {
          artistId: artistId,
        },
      });

      if (!reviewAvg) {
        await this.reviewAgProvider.repo().insert({
          artistId: artistId,
          value: body.rating,
          count: 1,
          eventId: eventId,
        });

        return { status: DefaultResponseStatus.OK, data: 'Review created' };
      }

      const newRating =
        (reviewAvg.value * reviewAvg.count + body.rating) /
        (reviewAvg.count + 1);

      await this.reviewAgProvider
        .repo()
        .createQueryBuilder()
        .update()
        .set({
          value: newRating,
          count: reviewAvg.count + 1,
        })
        .where('artistId = :artistId', {
          artistId: artistId,
        })
        .execute();
    }
  }
  private async emptyReviewFlow(
    eventId: number,
    artistId: number,
    userId: number,
    body: ReviewArtistRequestDto,
  ): Promise<DefaultResponseDto> {
    const userRated = await this.reviewProvider.repo().findOne({
      where: {
        createBy: userId,
      },
    });

    if (userRated) {
      return DefaultResponseHelper.ok;
    }

    try {
      await this.reviewProvider
        .repo()
        .createQueryBuilder()
        .insert()
        .into('review')
        .values({
          artistId: artistId,
          eventId: eventId,
          createBy: userId,
          displayName: body.displayName,
          isRated: false,
        } as Review)
        .execute();
      return { status: DefaultResponseStatus.OK, data: 'Review created' };
    } catch (error) {
      this.logger.error(error);
      throw new DomainUnProcessableEntity('Error saving review');
    }
  }
}
