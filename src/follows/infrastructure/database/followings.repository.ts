import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { z } from 'zod';

import { BaseComponent } from '../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import { DbServiceConflict } from '../../../global/infrastructure/exceptions/dbService.exception';
import { ArtistFollowersMap } from '../../domain/maps/artistFollowers.map';
import { Following } from '../entities/following.entity';

const FollowsCountSchema = z.object({
  artistId: z.string(),
  count: z.number(),
});

const FollowsCountsArraySchema = z.array(FollowsCountSchema);

export type FollowsCountType = z.infer<typeof FollowsCountsArraySchema>;

const UserFollowsArtistsSchema = z.map(z.string(), z.boolean());

@Injectable()
export class FollowingsRepository extends BaseComponent {
  constructor(
    @InjectRepository(Following, 'follow-db')
    private readonly followsRepository: Repository<Following>,
  ) {
    super(FollowingsRepository.name);
  }

  async findById(id: string) {
    return this.followsRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<Following>) {
    return this.followsRepository.find(options);
  }

  async findByKey(findConditions: FindOptionsWhere<Following>) {
    return this.followsRepository.find({
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
    return this.followsRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<Following>,
  ): Promise<Following | undefined> {
    return this.followsRepository.findOne(options);
  }

  async save(artist: DeepPartial<Following>): Promise<Following> {
    return this.followsRepository.save(artist);
  }

  async existFollower(
    userFollowingId: string,
    followedUserId: string,
  ): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.followsRepository.query(
      `SELECT EXISTS(SELECT 1 FROM following f WHERE f.user_following_id = $1 AND f.user_id = $2)`,
      [userFollowingId, followedUserId],
    );

    return result.exists;
  }

  async countFollows(userFollowingId: string): Promise<number> {
    return this.followsRepository.count({ where: { userFollowingId } });
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.followsRepository.delete(id);
  }

  async countFollowsByArtistIds(
    artistIds: string[],
  ): Promise<ArtistFollowersMap> {
    let results: unknown[];

    try {
      results = await this.followsRepository
        .createQueryBuilder('following')
        .select('following.user_id', 'artistId')
        .addSelect('CAST(COUNT(following.user_id) AS INTEGER)', 'count')
        .where('following.user_id IN (:...artistIds)', { artistIds })
        .groupBy('following.user_id')
        .getRawMany();
    } catch (error) {
      throw new DbServiceConflict(this, 'Error counting follows', error);
    }

    const validationResult = FollowsCountsArraySchema.safeParse(results);

    if (!validationResult.success) {
      throw new DbServiceConflict(this, "Couldn't parse follows count results");
    }

    const resultMap = new ArtistFollowersMap();
    for (let i = 0; i < results.length; i++) {
      resultMap.addArtist(
        validationResult.data[i].artistId,
        validationResult.data[i].count,
      );
    }
    return resultMap;
  }

  async userFollowsArtist(
    userFollowingId: string,
    artistId: string,
  ): Promise<boolean> {
    const [result]: ExistsQueryResult[] = await this.followsRepository.query(
      `SELECT EXISTS(SELECT 1 FROM following f WHERE f.user_following_id = $1 AND f.user_id = $2)`,
      [userFollowingId, artistId],
    );

    return result.exists;
  }

  async userFollowsArtists(
    userFollowingId: string,
    artistIds: string[],
  ): Promise<Map<string, boolean>> {
    type QueryResultRow = {
      artistId: string;
      follows: boolean;
    };

    const result: QueryResultRow[] = await this.followsRepository.query(
      `SELECT a."artistId", EXISTS(SELECT 1 FROM following f WHERE f.user_following_id = $1 AND f.user_id = a."artistId") as follows
       FROM (SELECT unnest($2::text[]) as "artistId") as a`,
      [userFollowingId, artistIds],
    );

    const artistMap = new Map<string, boolean>(
      result.map(row => [row.artistId, row.follows]),
    );

    const validatedArtistMap = UserFollowsArtistsSchema.parse(artistMap);

    return validatedArtistMap;
  }
}
