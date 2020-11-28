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
    addFollow(artists: Artist, topic: string, newFollow: FollowTopic): Promise<Artist>;
    findById(id: string): Promise<Artist>;
    find(options: FindManyOptions<Artist>): Promise<Artist[]>;
    findOne(options?: FindOneOptions<Artist>): Promise<Artist | undefined>;
    save(artist: DeepPartial<Artist>): Promise<Artist>;
    delete(id: string): Promise<DeleteResult>;
}
