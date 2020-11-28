import { DomainException } from "../../global/domain/exceptions/domain.exception";
import { ArtistsService } from "../domain/services/artists.service";
import { BaseArtistResponse } from "../infrastructure/dtos/baseArtistResponse.dto";
import { UpdateArtistDto } from "../infrastructure/dtos/updateArtist.dto";
export declare class UpdateArtistBasicInfoUseCase {
    private readonly aristsService;
    constructor(aristsService: ArtistsService);
    execute(id: string, updateArtistDto: UpdateArtistDto): Promise<BaseArtistResponse | DomainException>;
}
