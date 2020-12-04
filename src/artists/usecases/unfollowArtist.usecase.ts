import { Injectable } from '@nestjs/common';
import { DomainConflictException } from 'src/global/domain/exceptions/domainConflict.exception';
import { DomainInternalServerErrorException } from 'src/global/domain/exceptions/domainInternalServerError.exception';
import { getConnection } from 'typeorm';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { FollowersService } from '../domain/services/followers.service';
import { Follow } from '../infrastructure/entities/follow.entity';
import { Follower } from '../infrastructure/entities/follower.entity';

@Injectable()
export class UnfollowArtistUseCase {
  constructor(private readonly followersService: FollowersService) {}

  async execute(
    artistUserId: number,
    userId: number,
  ): Promise<boolean | DomainException> {
    let result: boolean | DomainException;
    const connection = getConnection('artist-db');
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    const existsFollower = await this.followersService.existsFollowerInArtist(
      artistUserId,
      userId,
    );
    if (!existsFollower) {
      return new DomainConflictException('Follower not exist');
    }

    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .getRepository(Follower)
        .delete({ followedUserId: artistUserId, userId });

      await queryRunner.manager
        .getRepository(Follow)
        .delete({ followerUserId: userId, userId: artistUserId });

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
