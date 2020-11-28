import { Repository } from 'typeorm';
import { Follower } from 'src/artists/infrastructure/entities/follower.entity';
export declare class FolllowersService {
    private readonly followersRepository;
    private readonly serviceName;
    constructor(followersRepository: Repository<Follower>);
}
