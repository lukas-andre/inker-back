import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as stringify from 'json-stringify-safe';
import {
  DeepPartial,
  DeleteResult,
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';
import { BaseService } from '../../../global/domain/services/base.service';
import { CreateArtistDto } from '../../infrastructure/dtos/createArtist.dto';
import { Artist } from '../../infrastructure/entities/artist.entity';

@Injectable()
export class ArtistsService extends BaseService {
  constructor(
    @InjectRepository(Artist, 'artist-db')
    private readonly artistsRepository: Repository<Artist>,
  ) {
    super(ArtistsService.name);
  }

  async create(dto: CreateArtistDto): Promise<Artist | ServiceError> {
    const exists = await this.artistsRepository.findOne({
      userId: dto.userId,
    });

    if (exists) {
      return this.serviceError(
        this.create,
        `Artists with user id: ${dto.userId} already exist`,
      );
    }

    const artist = this.artistsRepository.create();
    artist.userId = dto.userId;
    artist.firstName = dto.firstName;
    artist.lastName = dto.lastName;
    artist.contactEmail = dto.contactEmail;
    artist.contactPhoneNumber = dto.phoneNumber;
    artist.username = dto.username;

    try {
      return this.artistsRepository.save(artist);
    } catch (error) {
      return this.serviceError(
        this.create,
        `Trouble creating artist ${stringify(artist)}`,
        error.message,
      );
    }
  }

  async existArtist(artistId: number): Promise<boolean | undefined> {
    const result: ExistsQueryResult[] = await this.artistsRepository.query(
      `SELECT EXISTS(SELECT 1 FROM artist a WHERE a.id = $1)`,
      [artistId],
    );

    return result.pop().exists;
  }

  async existArtistByUserId(userId: number): Promise<boolean | undefined> {
    const result: ExistsQueryResult[] = await this.artistsRepository.query(
      `SELECT EXISTS(SELECT 1 FROM artist a WHERE a.user_id = $1)`,
      [userId],
    );

    return result.pop().exists;
  }

  async findByKey(options: FindConditions<Artist>) {
    return this.artistsRepository.find({
      select: [
        'id',
        'genres',
        'lastName',
        'profileThumbnail',
        'shortDescription',
        'tags',
        'userId',
        'contactEmail',
        'contactPhoneNumber',
        'firstName',
      ],
      where: {
        ...options,
      },
    });
  }

  async findById(id: number): Promise<Artist | ServiceError> {
    try {
      return this.artistsRepository.findOne(id);
    } catch (error) {
      return this.serviceError(
        this.findById,
        'Problems finding artist by id',
        error.message,
      );
    }
  }

  async findByIds(ids: number[]) {
    return this.artistsRepository.findByIds(ids);
  }

  async find(options: FindManyOptions<Artist>) {
    return this.artistsRepository.find(options);
  }

  async findAndCount(options: FindManyOptions<Artist>) {
    return this.artistsRepository.findAndCount(options);
  }

  async findOne(options?: FindOneOptions<Artist>): Promise<Artist | undefined> {
    return this.artistsRepository.findOne(options);
  }

  async save(artist: DeepPartial<Artist>): Promise<Artist | ServiceError> {
    try {
      return this.artistsRepository.save(artist);
    } catch (error) {
      return this.serviceError(
        this.save,
        'Problems saving artist',
        error.message,
      );
    }
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.artistsRepository.delete(id);
  }
}
