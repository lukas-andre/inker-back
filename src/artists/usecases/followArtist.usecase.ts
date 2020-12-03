import { Injectable } from '@nestjs/common';
import { DomainConflictException } from 'src/global/domain/exceptions/domainConflict.exception';
import { DomainInternalServerErrorException } from 'src/global/domain/exceptions/domainInternalServerError.exception';
import { getConnection } from 'typeorm';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { FollowersService } from '../domain/services/followers.service';
import { Follower } from '../infrastructure/entities/follower.entity';
import { AddFollowToArtistParams } from './interfaces/addFollowtoArtist.param';

@Injectable()
export class FollowUseCase {
  constructor(private readonly followersService: FollowersService) {}

  async execute(
    id: number,
    followParams: AddFollowToArtistParams,
  ): Promise<boolean | DomainException> {
    let result: boolean | DomainException;
    
    const connection = getConnection('artist-db');
    const queryRunner = connection.createQueryRunner();
    
    await queryRunner.connect();

    const existsFollower = await this.followersService.existFollower(id, followParams.userId)
    if (existsFollower) {
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
