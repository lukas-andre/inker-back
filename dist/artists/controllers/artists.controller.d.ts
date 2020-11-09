import { ArtistsHandler } from '../handlers/artists.handler';
import { CreateArtistDto } from '../dtos/createArtist.dto';
import { Artist } from '../entities/artist.entity';
export declare class ArtistsController {
    private readonly artistHandler;
    constructor(artistHandler: ArtistsHandler);
    create(createArtistDto: CreateArtistDto): Promise<Artist>;
    setProfileProflePicture(file: any, id: string): Promise<Artist>;
    getAllArtists(): Promise<Artist[]>;
}
