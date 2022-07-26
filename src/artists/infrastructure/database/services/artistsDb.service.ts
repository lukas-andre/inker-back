import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { BaseComponent } from '../../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../../global/domain/interfaces/existsQueryResult.interface';
import {
  DbServiceBadRule,
  DBServiceFindOneException,
  DBServiceSaveException,
} from '../../../../global/infrastructure/exceptions/dbService.exception';
import { CreateArtistParams } from '../../../usecases/interfaces/createArtist.params';
import { Artist } from '../../entities/artist.entity';
import { Contact } from '../../entities/contact.entity';

@Injectable()
export class ArtistsDbService extends BaseComponent {
  constructor(
    @InjectRepository(Artist, 'artist-db')
    private readonly artistsRepository: Repository<Artist>,
  ) {
    super(ArtistsDbService.name);
  }

  async create(dto: CreateArtistParams): Promise<Artist> {
    const exists = await this.existArtistByUserId(dto.userId);

    if (exists) {
      throw new DbServiceBadRule(this, 'Artist already exists');
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
      throw new DBServiceSaveException(
        this,
        `Problems creating artist ${artist.id}`,
        error,
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

  async findById(id: number): Promise<Artist> {
    try {
      return await this.artistsRepository.findOne({ where: { id } });
    } catch (error) {
      throw new DBServiceFindOneException(
        this,
        'Problems finding artist',
        error,
      );
    }
  }

  async findByIds(ids: number[]) {
    try {
      return await this.artistsRepository.find({
        where: {
          id: In(ids),
        },
      });
    } catch (error) {
      throw new DBServiceFindOneException(
        this,
        'Problems finding artist',
        error,
      );
    }
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

  async save(artist: DeepPartial<Artist>): Promise<Artist> {
    try {
      return await this.artistsRepository.save(artist);
    } catch (error) {
      throw new DBServiceSaveException(this, 'Problems saving artist', error);
    }
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.artistsRepository.delete(id);
  }
}
