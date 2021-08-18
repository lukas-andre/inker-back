import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { ArtistsService } from '../../artists/domain/services/artists.service';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { DomainInternalServerErrorException } from '../../global/domain/exceptions/domainInternalServerError.exception';
import { UserType } from '../../users/domain/enums/userType.enum';
import { UsersService } from '../../users/domain/services/users.service';
import { FollowedsService } from '../domain/services/followeds.service';
import { Followed } from '../infrastructure/entities/followed.entity';
import { Following } from '../infrastructure/entities/following.entity';
import { FollowArtistParams } from './interfaces/followArtist.param';
// TODO: EXTEND BASE USECASE
@Injectable()
export class FollowUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly artistsService: ArtistsService,
    private readonly followedsService: FollowedsService,
  ) {}

  async execute(
    followedUserId: number,
    follower: FollowArtistParams,
  ): Promise<boolean | DomainException> {
    let result: boolean | DomainException;

    const connection = getConnection('follow-db');
    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();

    // ! THIS IS LIMITING THAT ONLY ARTISTS ARE FOLLOWED
    if (!(await this.usersService.existsArtist(followedUserId))) {
      return new DomainConflictException('Artist not exists');
    }

    if (
      await this.followedsService.existsFollowerInArtist(
        followedUserId,
        follower.userId,
      )
    ) {
      return new DomainConflictException('Follower already exists');
    }

    // TODO: This could be came from in the front request
    const artistData = await this.artistsService.findOne({
      select: [
        'id',
        'userId',
        'username',
        'firstName',
        'lastName',
        'profileThumbnail',
      ],
      where: { userId: followedUserId },
    });

    console.log('artistData: ', artistData);

    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(Followed, {
        userFollowedId: artistData.userId,
        ...Object.assign(new Followed(), follower),
      });

      await queryRunner.manager.save(Following, {
        ...Object.assign(new Following(), {
          userFollowingId: follower.userId,
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
