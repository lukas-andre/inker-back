import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as stringify from 'json-stringify-safe';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { ExistsQueryResult } from '../../../../global/domain/interfaces/existsQueryResult.interface';
import { ServiceError } from '../../../../global/domain/interfaces/serviceError';
import { BaseService } from '../../../../global/domain/services/base.service';
import { CreateArtistParams } from '../../../usecases/interfaces/createArtist.params';
import { Artist } from '../../entities/artist.entity';
import { Contact } from '../../entities/contact.entity';

@Injectable()
export class ArtistsDbService extends BaseService {
  constructor(
    @InjectRepository(Artist, 'artist-db')
    private readonly artistsRepository: Repository<Artist>,
  ) {
    super(ArtistsDbService.name);
  }

  async create(dto: CreateArtistParams): Promise<Artist | ServiceError> {
    const exists = await this.artistsRepository.findOne({
      where: {
        userId: dto.userId,
      },
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
    artist.username = dto.username;

    const contact = new Contact();

    contact.email = dto.contactEmail;
    contact.phone = dto.phoneNumberDetails.number;
    contact.phoneDialCode = dto.phoneNumberDetails.dialCode;
    contact.phoneCountryIsoCode = dto.phoneNumberDetails.countryCode;

    artist.contact = contact;

    try {
      return await this.artistsRepository.save(artist);
    } catch (error) {
      return this.serviceError(
        this.create,
        `Trouble creating artist ${artist.username}`,
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

  async findByKey(options: FindOptionsWhere<Artist>) {
    return this.artistsRepository.find({
      select: [
        'id',
        'genres',
        'lastName',
        'profileThumbnail',
        'shortDescription',
        'tags',
        'userId',
        'firstName',
      ],
      where: {
        ...options,
      },
    });
  }

  async findById(id: number): Promise<Artist | ServiceError> {
    try {
      return await this.artistsRepository.findOne({ where: { id } });
    } catch (error) {
      return this.serviceError(
        this.findById,
        'Problems finding artist by id',
        error.message,
      );
    }
  }

  async findByIds(ids: number[]) {
    return this.artistsRepository.find({
      where: {
        id: In(ids),
      },
    });
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
      return await this.artistsRepository.save(artist);
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
