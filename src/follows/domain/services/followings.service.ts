import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Following } from '../../infrastructure/entities/following.entity';
import {
  Repository,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  DeepPartial,
  FindConditions,
} from 'typeorm';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';

@Injectable()
export class FollowingsService {
  private readonly serviceName: string = FollowingsService.name;

  constructor(
    @InjectRepository(Following, 'follow-db')
    private readonly followsRepository: Repository<Following>,
  ) {}

  async findById(id: string) {
    return await this.followsRepository.findOne(id);
  }

  async find(options: FindManyOptions<Following>) {
    return await this.followsRepository.find(options);
  }

  async findByKey(findConditions: FindConditions<Following>) {
    return await this.followsRepository.find({
      select: [
        'userFollowingId',
        'userType',
        'userTypeId',
        'userId',
        'username',
        'fullname',
        'profileThumbnail',
      ],
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<Following>) {
    return await this.followsRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<Following>,
  ): Promise<Following | undefined> {
    return await this.followsRepository.findOne(options);
  }

  async save(artist: DeepPartial<Following>): Promise<Following> {
    return await this.followsRepository.save(artist);
  }

  async existFollower(
    userFollowingId: number,
    followedUserId: number,
  ): Promise<boolean | undefined> {
    const result: ExistsQueryResult[] = await this.followsRepository.query(
      `SELECT EXISTS(SELECT 1 FROM following f WHERE f.user_following_id = $1 AND f.user_id = $2)`,
      [userFollowingId, followedUserId],
    );

    return result.pop().exists;
  }

  async countFollows(userFollowingId: number): Promise<number> {
    return this.followsRepository.count({ where: { userFollowingId } });
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.followsRepository.delete(id);
  }
}
