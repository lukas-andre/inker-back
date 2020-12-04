import { Injectable } from '@nestjs/common';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { DomainInternalServerErrorException } from '../../global/domain/exceptions/domainInternalServerError.exception';
import { getConnection } from 'typeorm';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { ArtistsService } from '../domain/services/artists.service';
import { FollowersService } from '../domain/services/followers.service';
import { Follower } from '../infrastructure/entities/follower.entity';
import { FollowArtistParams } from './interfaces/followArtist.param';
import { Follow } from '../infrastructure/entities/follow.entity';
import { FollowType } from '../domain/followType';
import { UserType } from 'src/users/domain/enums/userType.enum';

@Injectable()
export class FollowUseCase {
  constructor(
    private readonly followersService: FollowersService,
    private readonly artistsService: ArtistsService,
  ) {}

  async execute(
    followedArtistUserId: number,
    follower: FollowArtistParams,
  ): Promise<boolean | DomainException> {
    let result: boolean | DomainException;

    const connection = getConnection('artist-db');
    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();
    if (
      !(await this.artistsService.existArtistByUserId(followedArtistUserId))
    ) {
      return new DomainConflictException('Artist not exists');
    }

    if (
      await this.followersService.existsFollowerInArtist(
        followedArtistUserId,
        follower.userId,
      )
    ) {
      return new DomainConflictException('Follower already exists');
    }
    const artistData = await this.artistsService.findOne({
      select: [
        'id',
        'userId',
        'username',
        'firstName',
        'lastName',
        'profileThumbnail',
      ],
      where: { userId: followedArtistUserId },
    });

    console.log('artistData: ', artistData);

    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(Follower, {
        followedUserId: artistData.userId,
        ...Object.assign(new Follower(), follower),
      });

      await queryRunner.manager.save(Follow, {
        ...Object.assign(new Follow(), {
          followerUserId: follower.userId,
          userType: UserType.ARTIST,
          userId: artistData.userId,
          fullname: [artistData.firstName, artistData.lastName].join(' '),
          profileThumbnail: artistData.profileThumbnail,
          userTypeId: artistData.id,
          username: artistData.username,
        }),
      });

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
