import { Repository, DeleteResult, FindManyOptions, FindOneOptions, DeepPartial } from 'typeorm';
import { Follower } from '../../infrastructure/entities/follower.entity';
export declare class FollowersService {
    private readonly followersRepository;
    private readonly serviceName;
    constructor(followersRepository: Repository<Follower>);
    findById(id: string): Promise<Follower>;
    find(options: FindManyOptions<Follower>): Promise<Follower[]>;
    findOne(options?: FindOneOptions<Follower>): Promise<Follower | undefined>;
    save(artist: DeepPartial<Follower>): Promise<Follower>;
    existFollower(artistId: string, userId: string): Promise<boolean | undefined>;
    countFollowers(id: string): Promise<number>;
    delete(id: string): Promise<DeleteResult>;
}
