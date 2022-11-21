import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';

import { ArtistsDbService } from '../../artists/infrastructure/database/services/artistsDb.service';
import { BaseComponent } from '../../global/domain/components/base.component';
import {
  DomainBadRequest,
  DomainConflict,
  DomainException,
  DomainInternalServerError,
} from '../../global/domain/exceptions/domain.exception';
import { DefaultResponseDto } from '../../global/infrastructure/dtos/defaultResponse.dto';
import { DefaultResponse } from '../../global/infrastructure/helpers/defaultResponse.helper';
import { UserType } from '../../users/domain/enums/userType.enum';
import { UsersService } from '../../users/domain/services/users.service';
import { FollowedsService } from '../domain/services/followeds.service';
import { Followed } from '../infrastructure/entities/followed.entity';
import { Following } from '../infrastructure/entities/following.entity';

import { FollowArtistParams } from './interfaces/followArtist.param';
// TODO: EXTEND BASE USECASE
@Injectable()
export class FollowUseCase extends BaseComponent {
  constructor(
    private readonly usersService: UsersService,
    private readonly artistsDbService: ArtistsDbService,
    private readonly followedsService: FollowedsService, // @InjectDataSource('follow-db') // private followDbDataSource: DataSource,
  ) {
    super(FollowUseCase.name);
  }

  async execute(
    followedUserId: number,
    follower: FollowArtistParams,
  ): Promise<DefaultResponseDto> {
    let exception: DomainException;

    // TODO: TEST THIS FOR ERROR DEPRECATED METHOD
    // const queryRunner2 = this.followDbDataSource.createQueryRunner();

    const connection = getConnection('follow-db');
    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();

    // ! THIS IS LIMITING THAT ONLY ARTISTS ARE FOLLOWED
    if (!(await this.usersService.existsArtist(followedUserId))) {
      throw new DomainBadRequest('Artist not exists');
    }

    if (
      await this.followedsService.existsFollowerInArtist(
        followedUserId,
        follower.userId,
      )
    ) {
      throw new DomainConflict('Follower already exists');
    }

    // TODO: This could be came from in the front request
    const artistData = await this.artistsDbService.findOne({
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
      exception = new DomainInternalServerError('Fail follow transaction');
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    if (exception instanceof DomainException) {
      throw exception;
    }

    return DefaultResponse.ok;
  }
}
