import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  DeepPartial,
  FindConditions,
} from 'typeorm';
import { Follower } from '../../infrastructure/entities/follower.entity';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';

@Injectable()
export class FollowersService {
  private readonly serviceName: string = FollowersService.name;

  constructor(
    @InjectRepository(Follower, 'artist-db')
    private readonly followersRepository: Repository<Follower>,
  ) {}

  async findById(id: string) {
    return await this.followersRepository.findOne(id);
  }

  async find(options: FindManyOptions<Follower>) {
    return await this.followersRepository.find(options);
  }

  async findByKey(findConditions: FindConditions<Follower>) {
    return await this.followersRepository.find({
      select: [
        'followedUserId',
        'fullname',
        'profileThumbnail',
        'userId',
        'userType',
        'userTypeId',
        'username',
      ],
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<Follower>) {
    return await this.followersRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<Follower>,
  ): Promise<Follower | undefined> {
    return await this.followersRepository.findOne(options);
  }

  async save(artist: DeepPartial<Follower>): Promise<Follower> {
    return await this.followersRepository.save(artist);
  }

  async existsFollowerInArtist(
    artistUserId: number,
    userId: number,
  ): Promise<boolean | undefined> {
    const result: ExistsQueryResult[] = await this.followersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM follower f WHERE f.followed_user_id = $1 AND f.user_id = $2)`,
      [artistUserId, userId],
    );

    return result.pop().exists;
  }

  async countFollowers(followedUserId: number): Promise<number> {
    return this.followersRepository.count({ where: { followedUserId} });
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.followersRepository.delete(id);
  }
}
