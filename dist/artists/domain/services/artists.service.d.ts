import { CreateArtistDto } from '../../infrastructure/dtos/createArtist.dto';
import { Artist } from '../../infrastructure/entities/artist.entity';
import { Repository, DeleteResult, FindManyOptions, FindOneOptions, DeepPartial } from 'typeorm';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';
import { FollowTopic } from '../../../customers/domain/interfaces/customerFollows.interface';
export declare class ArtistsService {
    private readonly artistsRepository;
    private readonly serviceName;
    constructor(artistsRepository: Repository<Artist>);
    create(dto: CreateArtistDto): Promise<Artist | ServiceError>;
    existArtist(artistId: number): Promise<boolean | undefined>;
    addFollow(artists: Artist, topic: string, newFollow: FollowTopic): Promise<Artist>;
    findById(id: number): Promise<Artist>;
    find(options: FindManyOptions<Artist>): Promise<Artist[]>;
    findAndCount(options: FindManyOptions<Artist>): Promise<[Artist[], number]>;
    findOne(options?: FindOneOptions<Artist>): Promise<Artist | undefined>;
    save(artist: DeepPartial<Artist>): Promise<Artist>;
    delete(id: number): Promise<DeleteResult>;
}
