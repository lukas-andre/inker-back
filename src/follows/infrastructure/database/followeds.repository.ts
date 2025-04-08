import { Injectable } from '@nestjs/common';
import {
  InjectDataSource,
  InjectEntityManager,
  InjectRepository,
} from '@nestjs/typeorm';
import {
  DataSource,
  DeepPartial,
  DeleteResult,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import { FOLLOW_DB_CONNECTION_NAME } from '../../../databases/constants';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import { DbServiceNotFound } from '../../../global/infrastructure/exceptions/dbService.exception';
import { Followed } from '../entities/followed.entity';

@Injectable()
export class FollowedsRepository extends BaseComponent {
  constructor(
    @InjectRepository(Followed, FOLLOW_DB_CONNECTION_NAME)
    private readonly followersRepository: Repository<Followed>,
    @InjectDataSource(FOLLOW_DB_CONNECTION_NAME)
    private readonly dataSource: DataSource,
    @InjectEntityManager(FOLLOW_DB_CONNECTION_NAME)
    private readonly entityManager: EntityManager,
  ) {
    super(FollowedsRepository.name);
  }

  get source(): DataSource {
    return this.dataSource;
  }

  get manager(): EntityManager {
    return this.entityManager;
  }

  async findById(id: string) {
    return this.followersRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<Followed>) {
    return this.followersRepository.find(options);
  }

  async findByKey(findConditions: FindOptionsWhere<Followed>) {
    try {
      return await this.followersRepository.find({
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
    } catch (error) {
      throw new DbServiceNotFound(this, 'Trouble finding event', error);
    }
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
    artistUserId: string,
    followerUserId: string,
  ): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.followersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM followed f WHERE f.user_followed_id = $1 AND f.user_id = $2)`,
      [artistUserId, followerUserId],
    );

    return result.exists;
  }

  async countFollowers(userFollowedId: string): Promise<number> {
    return this.followersRepository.count({ where: { userFollowedId } });
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.followersRepository.delete(id);
  }
}
