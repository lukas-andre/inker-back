import { Injectable } from '@nestjs/common';
import { CreateArtistDto } from '../../infrastructure/dtos/createArtist.dto';
import { Artist } from '../../infrastructure/entities/artist.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  DeepPartial,
} from 'typeorm';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';
import { FollowTopic } from '../../../customers/domain/interfaces/customerFollows.interface';
import { Follower } from '../../infrastructure/entities/follower.entity';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
// import { FollowDto } from 'src/artists/infrastructure/dtos/follow.dto';

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

  async existFollower(
    artistId: number,
    userId: number,
  ): Promise<boolean | undefined> {
    const result: ExistsQueryResult[] = await this.followersRepository.query(
      `SELECT EXISTS(SELECT 1 FROM follower f WHERE f.artist_id = $1 AND f.user_id = $2)`,
      [artistId, userId],
    );

    return result.pop().exists;
  }

  async countFollowers(id: number): Promise<number> {
    return this.followersRepository.count({ where: { artistId: id } });
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.followersRepository.delete(id);
  }
}
