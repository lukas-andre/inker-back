import { ConfigService } from '@nestjs/config';
import { ArtistsService } from '../services/artists.service';
import { CreateArtistDto } from '../dtos/createArtist.dto';
import { MultimediasService } from '../../multimedias/services/multimedias.service';
import { Artist } from '../entities/artist.entity';
export declare class ArtistsHandler {
    private readonly artistsService;
    private readonly multimediasService;
    private readonly configService;
    constructor(artistsService: ArtistsService, multimediasService: MultimediasService, configService: ConfigService);
    handleCreate(createArtistdto: CreateArtistDto): Promise<Artist>;
    handleSetProfileProflePicture(id: string, file: any): Promise<Artist>;
    handleFindById(id: string): Promise<Artist>;
    handleGetAll(): Promise<Artist[]>;
}
