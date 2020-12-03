import { Injectable } from '@nestjs/common';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { DomainInternalServerErrorException } from '../../global/domain/exceptions/domainInternalServerError.exception';
import { getConnection } from 'typeorm';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { ArtistsService } from '../domain/services/artists.service';
import { FollowersService } from '../domain/services/followers.service';
import { Follower } from '../infrastructure/entities/follower.entity';
import { FollowArtistParams } from './interfaces/followArtist.param';

@Injectable()
export class FollowUseCase {
  constructor(
    private readonly followersService: FollowersService,
    private readonly artistsService: ArtistsService,
  ) {}

  async execute(
    id: number,
    followParams: FollowArtistParams,
  ): Promise<boolean | DomainException> {
    let result: boolean | DomainException;

    const connection = getConnection('artist-db');
    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();
    if (!(await this.artistsService.existArtist(id))) {
      return new DomainConflictException('Artist not exists');
    }

    if (await this.followersService.existFollower(id, followParams.userId)) {
      return new DomainConflictException('Follower already exists');
    }

    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(Follower, {
        artistId: id,
        ...Object.assign(new Follower(), followParams),
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
