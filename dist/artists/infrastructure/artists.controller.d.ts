import { ArtistsHandler } from './artists.handler';
import { CreateArtistDto } from './dtos/createArtist.dto';
import { BaseArtistResponse } from './dtos/baseArtistResponse.dto';
import { UpdateArtistDto } from './dtos/updateArtist.dto';
export declare class ArtistsController {
    private readonly artistHandler;
    constructor(artistHandler: ArtistsHandler);
    create(createArtistDto: CreateArtistDto): Promise<BaseArtistResponse>;
    updateProfileProflePicture(file: any, id: string): Promise<BaseArtistResponse>;
    findAllArtists(): Promise<BaseArtistResponse[]>;
    findArtistById(id: string): Promise<BaseArtistResponse>;
    updateArtistBasicInfo(id: string, body: UpdateArtistDto): Promise<BaseArtistResponse>;
    follow(id: string, request: any): Promise<void>;
}
