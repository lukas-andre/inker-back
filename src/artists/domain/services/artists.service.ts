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

@Injectable()
export class ArtistsService {
  private readonly serviceName: string = ArtistsService.name;

  constructor(
    @InjectRepository(Artist, 'artist-db')
    private readonly artistsRepository: Repository<Artist>,
  ) {}

  async create(dto: CreateArtistDto): Promise<Artist | ServiceError> {
    const exists = await this.artistsRepository.findOne({
      userId: dto.userId,
    });

    if (exists) {
      return {
        error: `Artists with user id: ${dto.userId} already exist`,
        subject: this.serviceName,
        method: this.create.name,
      } as ServiceError;
    }

    const artists = Object.assign(new Artist(), dto);

    return await this.artistsRepository.save(artists);
  }

  async addFollow(artists: Artist, topic: string, newFollow: FollowTopic) {
    return await this.artistsRepository.save(artists);
  }

  async findById(id: string) {
    return await this.artistsRepository.findOne(id);
  }

  async find(options: FindManyOptions<Artist>) {
    return await this.artistsRepository.find(options);
  }

  async findOne(options?: FindOneOptions<Artist>): Promise<Artist | undefined> {
    return await this.artistsRepository.findOne(options);
  }

  async save(artist: DeepPartial<Artist>): Promise<Artist> {
    return await this.artistsRepository.save(artist);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.artistsRepository.delete(id);
  }
}
