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
  In,
  Repository,
} from 'typeorm';

import { ARTIST_DB_CONNECTION_NAME } from '../../../databases/constants';
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
import { SearchArtistDto } from '../dtos/searchArtist.dto';
import { Artist } from '../entities/artist.entity';
import { Contact } from '../entities/contact.entity';

@Injectable()
export class ArtistRepository extends BaseComponent {
  constructor(
    @InjectRepository(Artist, 'artist-db')
    private readonly artistsRepository: Repository<Artist>,
    @InjectDataSource(ARTIST_DB_CONNECTION_NAME)
    private readonly dataSource: DataSource,
    @InjectEntityManager(ARTIST_DB_CONNECTION_NAME)
    private readonly entityManager: EntityManager,
  ) {
    super(ArtistRepository.name);
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

  async exists(artistId: string): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.artistsRepository.query(
      `SELECT EXISTS(SELECT 1 FROM artist a WHERE a.id = $1)`,
      [artistId],
    );

    return result.exists;
  }

  async existArtistByUserId(userId: string): Promise<boolean | undefined> {
    const [result]: ExistsQueryResult[] = await this.artistsRepository.query(
      `SELECT EXISTS(SELECT 1 FROM artist a WHERE a.user_id = $1)`,
      [userId],
    );

    return result.exists;
  }

  async findById(id: string): Promise<Artist> {
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

  async findByIdWithJoins(id: string): Promise<Artist> {
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

  async findByIdWithContact(id: string): Promise<Artist> {
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

  async findByIds(ids: string[]) {
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
    artistIds: string[],
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

  async delete(id: string): Promise<DeleteResult> {
    return this.artistsRepository.delete(id);
  }

  async searchArtists(searchParams: SearchArtistDto) {
    const { query, page = 1, limit = 10, minRating = 0 } = searchParams;

    try {
      const queryBuilder = this.artistsRepository
        .createQueryBuilder('artist')
        .select([
          'artist.id',
          'artist.username',
          'artist.firstName',
          'artist.lastName',
          'artist.shortDescription',
          'artist.profilePhoto',
          'artist.rating',
          'artist.studioPhoto',
          'contact.email',
          'contact.phone',
          'contact.phoneDialCode',
          'contact.phoneCountryIsoCode',
        ])
        .leftJoin('artist.contact', 'contact')
        .where('artist.deletedAt IS NULL');

      // Búsqueda optimizada usando índices
      if (query) {
        const searchTerm = query.toLowerCase();
        queryBuilder.andWhere(
          `(
            LOWER(artist.firstName) LIKE :searchTerm OR
            LOWER(artist.lastName) LIKE :searchTerm OR
            LOWER(artist.username) LIKE :searchTerm OR
            LOWER(artist.shortDescription) LIKE :searchTerm
          )`,
          { searchTerm: `%${searchTerm}%` },
        );
      }

      // Usar índice de rating
      if (minRating > 0) {
        queryBuilder.andWhere('artist.rating >= :minRating', { minRating });
      }

      // Obtener el total antes de la paginación
      const total = await queryBuilder.getCount();

      // Aplicar ordenamiento y paginación
      const artists = await queryBuilder
        .orderBy('artist.rating', 'DESC')
        .offset((page - 1) * limit)
        .limit(limit)
        .getMany();

      return {
        artists,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new DBServiceFindOneException(
        this,
        'Problems searching artists',
        error,
      );
    }
  }

  /**
   * Get artist basic info for monthly report using native SQL
   */
  async getArtistInfoForReport(artistId: string): Promise<any> {
    try {
      const [artistInfo] = await this.artistsRepository.query(
        `SELECT 
          json_build_object(
            'id', a.id,
            'username', a.username,
            'firstName', a.first_name,
            'lastName', a.last_name,
            'rating', a.rating,
            'email', c.email,
            'phone', c.phone
          ) as "artistInfo"
        FROM artist a
        LEFT JOIN contact c ON c.id = a.contact_id
        WHERE a.id = $1`,
        [artistId],
      );

      return artistInfo?.artistInfo || null;
    } catch (error) {
      throw new DBServiceFindOneException(
        this,
        'Problems getting artist info for report',
        error,
      );
    }
  }

  /**
   * Get all active artists for monthly report generation
   * Note: Cannot check agenda_event from here as it's in a different DB
   * Will return all active artists and filter later in service layer
   */
  async findActiveArtistsForReports(): Promise<
    { id: string; email: string; firstName: string; lastName: string }[]
  > {
    try {
      const artists = await this.artistsRepository.query(
        `SELECT 
          a.id,
          c.email,
          a.first_name as "firstName",
          a.last_name as "lastName"
        FROM artist a
        INNER JOIN contact c ON c.id = a.contact_id
        WHERE a.deleted_at IS NULL
          AND a.is_active = true`,
      );

      return artists;
    } catch (error) {
      throw new DBServiceFindOneException(
        this,
        'Problems finding active artists for reports',
        error,
      );
    }
  }

  /**
   * Batch get artist info using native SQL
   */
  async getArtistsByIds(artistIds: string[]): Promise<any[]> {
    if (artistIds.length === 0) return [];

    try {
      const placeholders = artistIds.map((_, i) => `$${i + 1}`).join(', ');

      const artists = await this.artistsRepository.query(
        `SELECT 
          a.id,
          json_build_object(
            'id', a.id,
            'username', a.username,
            'firstName', a.first_name,
            'lastName', a.last_name,
            'rating', a.rating,
            'profilePhoto', a.profile_photo,
            'contact', json_build_object(
              'email', c.email,
              'phone', c.phone
            )
          ) as "artistData"
        FROM artist a
        LEFT JOIN contact c ON c.id = a.contact_id
        WHERE a.id IN (${placeholders})
          AND a.deleted_at IS NULL`,
        artistIds,
      );

      return artists.map(row => ({
        id: row.id,
        ...row.artistData,
      }));
    } catch (error) {
      throw new DBServiceFindOneException(
        this,
        'Problems getting artists by ids',
        error,
      );
    }
  }

  /**
   * Find all active artists for monthly reports
   */
  async findActiveArtists(): Promise<any[]> {
    try {
      const artists = await this.artistsRepository.query(
        `SELECT 
          json_build_object(
            'id', a.id,
            'username', a.username,
            'firstName', a.first_name,
            'lastName', a.last_name,
            'contactEmail', c.email,
            'contact', json_build_object(
              'email', c.email,
              'phone', c.phone
            )
          ) as artist
        FROM artist a
        LEFT JOIN contact c ON a.contact_id = c.id
        WHERE a.is_active = true
          AND c.email IS NOT NULL  -- Only artists with valid email
        ORDER BY a.created_at ASC`,
      );

      return artists.map(row => row.artist);
    } catch (error) {
      this.logger.error('Error finding active artists:', error);
      throw error;
    }
  }
}
