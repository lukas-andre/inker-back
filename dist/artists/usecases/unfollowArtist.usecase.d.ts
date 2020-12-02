import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { FollowersService } from '../domain/services/followers.service';
export declare class UnfollowArtistUseCase {
    private readonly followersService;
    constructor(followersService: FollowersService);
    execute(id: string, userId: string): Promise<boolean | DomainException>;
}
