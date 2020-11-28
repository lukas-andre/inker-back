import { ArtistsService } from '../domain/services/artists.service';
import { CreateArtistDto } from '../infrastructure/dtos/createArtist.dto';
import { Artist } from '../infrastructure/entities/artist.entity';
import { DomainException } from 'src/global/domain/exceptions/domain.exception';
export declare class CreateArtistUseCase {
    private readonly artistsService;
    constructor(artistsService: ArtistsService);
    execute(createArtistdto: CreateArtistDto): Promise<Artist | DomainException>;
}
