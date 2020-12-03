import { ArtistsService } from '../domain/services/artists.service';
import { MultimediasService } from '../../multimedias/services/multimedias.service';
import { Artist } from '../infrastructure/entities/artist.entity';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
export declare class UpdateArtistProfilePictureUseCase {
    private readonly artistsService;
    private readonly multimediasService;
    constructor(artistsService: ArtistsService, multimediasService: MultimediasService);
    execute(id: number, file: any): Promise<Artist | DomainException>;
}
