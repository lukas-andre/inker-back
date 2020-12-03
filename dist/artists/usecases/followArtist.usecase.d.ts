import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { FollowersService } from '../domain/services/followers.service';
import { AddFollowToArtistParams } from './interfaces/addFollowtoArtist.param';
export declare class FollowUseCase {
    private readonly followersService;
    constructor(followersService: FollowersService);
    execute(id: number, followParams: AddFollowToArtistParams): Promise<boolean | DomainException>;
}
