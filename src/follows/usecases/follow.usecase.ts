import { Injectable } from '@nestjs/common';

import { ArtistRepository } from '../../artists/infrastructure/repositories/artist.repository';
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
import { FollowedsRepository } from '../infrastructure/database/followeds.repository';
import { Followed } from '../infrastructure/entities/followed.entity';
import { Following } from '../infrastructure/entities/following.entity';
import { UsersRepository } from '../../users/infrastructure/repositories/users.repository';

import { FollowArtistParams } from './interfaces/followArtist.param';
@Injectable()
export class FollowUseCase extends BaseComponent {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly artistProvider: ArtistRepository,
    private readonly followedsProvider: FollowedsRepository, // @InjectDataSource('follow-db') // private followDbDataSource: DataSource,
  ) {
    super(FollowUseCase.name);
  }

  async execute(
    toFollowUserId: string,
    newFollower: FollowArtistParams,
  ): Promise<DefaultResponseDto> {
    let exception: DomainException;

    const dataSource = this.followedsProvider.source;
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    // ! THIS IS LIMITING THAT ONLY ARTISTS ARE FOLLOWED
    if (!(await this.usersRepository.existsArtist(toFollowUserId))) {
      throw new DomainBadRequest('Artist not exists');
    }

    if (
      await this.followedsProvider.existsFollowerInArtist(
        toFollowUserId,
        newFollower.userId,
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
      where: { userId: toFollowUserId },
    });

    console.log('artistData: ', artistData);

    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(Followed, {
        userFollowedId: artistData.userId,
        ...Object.assign(new Followed(), newFollower),
      });

      await queryRunner.manager.save(Following, {
        ...Object.assign(new Following(), {
          userFollowingId: newFollower.userId,
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
