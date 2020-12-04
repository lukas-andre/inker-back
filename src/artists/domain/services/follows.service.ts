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
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import { Follow } from '../../infrastructure/entities/follow.entity';

@Injectable()
export class FollowsService {
  private readonly serviceName: string = FollowsService.name;

  constructor(
    @InjectRepository(Follow, 'artist-db')
    private readonly followsRepository: Repository<Follow>,
  ) {}

  async findById(id: string) {
    return await this.followsRepository.findOne(id);
  }

  async find(options: FindManyOptions<Follow>) {
    return await this.followsRepository.find(options);
  }

  async findByKey(findConditions: FindConditions<Follow>) {
    return await this.followsRepository.find({
      select: [
        'followerUserId',
        'fullname',
        'profileThumbnail',
        'userType',
        'userTypeId',
        'username',
      ],
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<Follow>) {
    return await this.followsRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<Follow>,
  ): Promise<Follow | undefined> {
    return await this.followsRepository.findOne(options);
  }

  async save(artist: DeepPartial<Follow>): Promise<Follow> {
    return await this.followsRepository.save(artist);
  }

  async existFollower(
    artistId: number,
    userId: number,
  ): Promise<boolean | undefined> {
    const result: ExistsQueryResult[] = await this.followsRepository.query(
      `SELECT EXISTS(SELECT 1 FROM follow f WHERE f.follower_user_id = $1 AND f.user_id = $2)`,
      [artistId, userId],
    );

    return result.pop().exists;
  }

  async countFollows(id: number): Promise<number> {
    return this.followsRepository.count({ where: { followerUserId: id } });
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.followsRepository.delete(id);
  }
}
