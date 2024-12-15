import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  DeepPartial,
  DeleteResult,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  In,
  Repository,
} from 'typeorm';

import { BaseComponent } from '../../../global/domain/components/base.component';
import { ExistsQueryResult } from '../../../global/domain/interfaces/existsQueryResult.interface';
import {
  DBServiceFindOneException,
  DBServiceSaveException,
  DbServiceBadRule,
} from '../../../global/infrastructure/exceptions/dbService.exception';
import { PROBLEMS_FILTERING_ARTISTS } from '../../../locations/domain/codes/codes';
import { RawFindByArtistIdsResponseDTO } from '../../../locations/infrastructure/dtos/findArtistByRangeResponse.dto';
import { CreateArtistParams } from '../../usecases/interfaces/createArtist.params';
import { Artist } from '../entities/artist.entity';
import { Contact } from '../entities/contact.entity';
import { SearchArtistDto } from '../dtos/searchArtist.dto';
import { ARTIST_DB_CONNECTION_NAME } from '../../../databases/constants';

@Injectable()
export class ArtistProvider extends BaseComponent {
  constructor(
    @InjectRepository(Artist, 'artist-db')
    private readonly artistsRepository: Repository<Artist>,
    @InjectDataSource(ARTIST_DB_CONNECTION_NAME)
    private readonly dataSource: DataSource,
    @InjectEntityManager(ARTIST_DB_CONNECTION_NAME)
    private readonly entityManager: EntityManager,
    
  ) {
    super(ArtistProvider.name);
  }

  get source(): DataSource {
    return this.dataSource;
  }

  get manager(): EntityManager {
    return this.entityManager;
  }

  repo() {
    return this.artistsRepository;
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

  async exists(artistId: number): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.artistsRepository.query(
      `SELECT EXISTS(SELECT 1 FROM artist a WHERE a.id = $1)`,
      [artistId],
    );

    return result.exists;
  }

  async existArtistByUserId(userId: number): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.artistsRepository.query(
      `SELECT EXISTS(SELECT 1 FROM artist a WHERE a.user_id = $1)`,
      [userId],
    );

    return result.exists;
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

  async findByIdWithJoins(id: number): Promise<Artist> {
    try {
      return await this.artistsRepository
        .createQueryBuilder('artist')
        .leftJoinAndSelect('artist.contact', 'contact')
        .leftJoinAndSelect('artist.services', 'services')
        .where('artist.id = :id', { id })
        .getOne();
    } catch (error) {
      throw new DBServiceFindOneException(
        this,
        'Problems finding artist',
        error,
      );
    }
  }

  async findByIdWithContact(id: number): Promise<Artist> {
    try {
      return await this.artistsRepository.findOne({
        where: { id },
        relations: ['contact'],
      });
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

  async rawFindByArtistIds(
    artistIds: number[],
  ): Promise<RawFindByArtistIdsResponseDTO[]> {
    const vars = artistIds.map((_, index) => `$${++index}`).join(',');

    try {
      return await this.artistsRepository.query(
        `SELECT
          json_build_object(
            'phone', c.phone,
            'email', c.email,
            'country', c.phone_country_iso_code
          )  as "contact",
          a.id,
          a.username,
          a.first_name as "firstName",
          a.last_name as "lastName",
          a.studio_photo as "studioPhoto",
          a.short_description as "shortDescription",
          a.profile_thumbnail as "profileThumbnail",
          a.rating
        FROM
          artist a
        INNER JOIN contact c ON c.id = a.contact_id  
        WHERE
          ( (a.id in (${vars})) )
        AND ( a.deleted_at is null )`,
        artistIds,
      );
    } catch (error) {
      throw new DBServiceFindOneException(
        this,
        PROBLEMS_FILTERING_ARTISTS,
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

  async searchArtists(searchParams: SearchArtistDto) {
    const { query, page = 1, limit = 10, minRating = 0 } = searchParams;
    
    try {
      const queryBuilder = this.artistsRepository
        .createQueryBuilder('artist')
        .leftJoinAndSelect('artist.contact', 'contact')
        .where('artist.deletedAt IS NULL');
  
      // Búsqueda por nombre, username o descripción
      if (query) {
        queryBuilder.andWhere(
          '(LOWER(artist.firstName) LIKE LOWER(:query) OR ' +
          'LOWER(artist.lastName) LIKE LOWER(:query) OR ' +
          'LOWER(artist.username) LIKE LOWER(:query) OR ' +
          'LOWER(artist.shortDescription) LIKE LOWER(:query))',
          { query: `%${query}%` }
        );
      }
  
      // Filtrar por rating mínimo
      if (minRating > 0) {
        queryBuilder.andWhere('artist.rating >= :minRating', { minRating });
      }
  
      // Agregar paginación
      const [artists, total] = await queryBuilder
        .orderBy('artist.rating', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
  
      return {
        artists,
        metadata: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new DBServiceFindOneException(
        this,
        'Problems searching artists',
        error,
      );
    }
  }
}
