import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { FollowerType } from '../domain/followerType';
import { ArtistsService } from '../domain/services/artists.service';
import { FollowersService } from '../domain/services/followers.service';
export declare class FindArtistFollowersUseCase {
    private readonly artistsService;
    private readonly followersService;
    private readonly logger;
    constructor(artistsService: ArtistsService, followersService: FollowersService);
    execute(artistId: number): Promise<FollowerType[] | DomainException>;
}
