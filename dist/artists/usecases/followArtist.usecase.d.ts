import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { ArtistsService } from '../domain/services/artists.service';
import { FollowersService } from '../domain/services/followers.service';
import { FollowArtistParams } from './interfaces/followArtist.param';
export declare class FollowUseCase {
    private readonly followersService;
    private readonly artistsService;
    constructor(followersService: FollowersService, artistsService: ArtistsService);
    execute(id: number, followParams: FollowArtistParams): Promise<boolean | DomainException>;
}
