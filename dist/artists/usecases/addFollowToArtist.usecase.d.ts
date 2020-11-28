import { DomainException } from "../../global/domain/exceptions/domain.exception";
import { ArtistsService } from "../domain/services/artists.service";
import { BaseArtistResponse } from "../infrastructure/dtos/baseArtistResponse.dto";
export declare class AddFollowToArtistUseCase {
    private readonly aristsService;
    private readonly FollowsService;
    constructor(aristsService: ArtistsService, FollowsService: any);
    execute(id: string, followParams: any): Promise<BaseArtistResponse | DomainException>;
}
