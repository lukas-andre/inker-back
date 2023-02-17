import { Injectable } from '@nestjs/common';
import { getConnection } from 'typeorm';

import { ArtistProvider } from '../../artists/infrastructure/database/artist.provider';
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
import { UsersProvider } from '../../users/infrastructure/providers/users.provider';
import { FollowedsService } from '../domain/services/followeds.service';
import { Followed } from '../infrastructure/entities/followed.entity';
import { Following } from '../infrastructure/entities/following.entity';

import { FollowArtistParams } from './interfaces/followArtist.param';
@Injectable()
export class FollowUseCase extends BaseComponent {
  constructor(
    private readonly usersProvider: UsersProvider,
    private readonly artistProvider: ArtistProvider,
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
    if (!(await this.usersProvider.existsArtist(followedUserId))) {
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
    const artistData = await this.artistProvider.findOne({
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
