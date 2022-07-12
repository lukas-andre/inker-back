import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import {
  DomainBadRequest,
  DomainException,
  DomainInternalServerError,
} from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { DefaultResponseDto } from '../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponseHelper } from '../../global/infrastructure/helpers/defaultResponse.helper';
import { FollowedsService } from '../domain/services/followeds.service';
import { Followed } from '../infrastructure/entities/followed.entity';
import { Following } from '../infrastructure/entities/following.entity';
@Injectable()
export class UnfollowUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly followedsService: FollowedsService) {
    super(UnfollowUseCase.name);
  }

  async execute(
    artistUserId: number,
    userId: number,
  ): Promise<DefaultResponseDto> {
    let exception: DomainException;
    const connection = getConnection('follow-db');
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    const existsFollower = await this.followedsService.existsFollowerInArtist(
      artistUserId,
      userId,
    );
    if (!existsFollower) {
      throw new DomainBadRequest('Follower not exist');
    }

    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .getRepository(Followed)
        .delete({ userFollowedId: artistUserId, userId });

      await queryRunner.manager
        .getRepository(Following)
        .delete({ userFollowingId: userId, userId: artistUserId });

      await queryRunner.commitTransaction();
    } catch (error) {
      exception = new DomainInternalServerError('Fail follow transaction');
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    if (exception instanceof DomainException) {
      throw exception;
    }

    return DefaultResponseHelper.ok;
  }
}
