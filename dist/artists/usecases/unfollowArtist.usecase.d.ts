import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { FollowersService } from '../domain/services/followers.service';
export declare class UnfollowArtistUseCase {
    private readonly followersService;
    constructor(followersService: FollowersService);
    execute(id: number, userId: number): Promise<boolean | DomainException>;
}
