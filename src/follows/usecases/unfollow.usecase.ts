import { Injectable } from '@nestjs/common';
import { DomainInternalServerErrorException } from '../../global/domain/exceptions/domainInternalServerError.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { getConnection } from 'typeorm';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { FollowedsService } from '../domain/services/followeds.service';
import { Followed } from '../infrastructure/entities/followed.entity';
import { Following } from '../infrastructure/entities/following.entity';

@Injectable()
export class UnfollowUseCase {
  constructor(private readonly followedsService: FollowedsService) {}

  async execute(
    artistUserId: number,
    userId: number,
  ): Promise<boolean | DomainException> {
    let result: boolean | DomainException;
    const connection = getConnection('artist-db');
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    const existsFollower = await this.followedsService.existsFollowerInArtist(
      artistUserId,
      userId,
    );
    if (!existsFollower) {
      return new DomainNotFoundException('Follower not exist');
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
      result = new DomainInternalServerErrorException(
        'Fail follow transaction',
      );
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return result instanceof DomainException ? result : true;
  }
}
