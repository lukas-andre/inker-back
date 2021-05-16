import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Followed } from '../../infrastructure/entities/followed.entity';
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
export class FollowedsService {
  private readonly serviceName: string = FollowedsService.name;

  constructor(
    @InjectRepository(Followed, 'follow-db')
    private readonly followersRepository: Repository<Followed>,
  ) {}

  async findById(id: string) {
    return this.followersRepository.findOne(id);
  }

  async find(options: FindManyOptions<Followed>) {
    return this.followersRepository.find(options);
  }

  async findByKey(findConditions: FindConditions<Followed>) {
    return this.followersRepository.find({
      select: [
        'userFollowedId',
        'userId',
        'userType',
        'userTypeId',
        'username',
        'fullname',
        'profileThumbnail',
      ],
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<Followed>) {
    return this.followersRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<Followed>,
  ): Promise<Followed | undefined> {
    return this.followersRepository.findOne(options);
  }

  async save(artist: DeepPartial<Followed>): Promise<Followed> {
    return this.followersRepository.save(artist);
  }

  async existsFollowerInArtist(
    artistUserId: number,
    followerUserId: number,
  ): Promise<boolean | undefined> {
    const result: ExistsQueryResult[] = await this.followersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM followed f WHERE f.user_followed_id = $1 AND f.user_id = $2)`,
      [artistUserId, followerUserId],
    );

    return result.pop().exists;
  }

  async countFollowers(userFollowedId: number): Promise<number> {
    return this.followersRepository.count({ where: { userFollowedId } });
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.followersRepository.delete(id);
  }
}
