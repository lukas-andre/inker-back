import { Repository, DeleteResult, FindManyOptions, FindOneOptions, DeepPartial } from 'typeorm';
import { Follower } from '../../infrastructure/entities/follower.entity';
export declare class FollowersService {
    private readonly followersRepository;
    private readonly serviceName;
    constructor(followersRepository: Repository<Follower>);
    findById(id: string): Promise<Follower>;
    find(options: FindManyOptions<Follower>): Promise<Follower[]>;
    findAndCount(options: FindManyOptions<Follower>): Promise<[Follower[], number]>;
    findOne(options?: FindOneOptions<Follower>): Promise<Follower | undefined>;
    save(artist: DeepPartial<Follower>): Promise<Follower>;
    existFollower(artistId: number, userId: number): Promise<boolean | undefined>;
    countFollowers(id: number): Promise<number>;
    delete(id: string): Promise<DeleteResult>;
}
