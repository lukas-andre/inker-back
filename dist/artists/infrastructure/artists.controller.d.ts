import { ArtistsHandler } from './artists.handler';
import { CreateArtistDto } from './dtos/createArtist.dto';
import { BaseArtistResponse } from './dtos/baseArtistResponse.dto';
import { UpdateArtistDto } from './dtos/updateArtist.dto';
import { FollowerDto } from './dtos/follow.dto';
export declare class ArtistsController {
    private readonly artistHandler;
    constructor(artistHandler: ArtistsHandler);
    create(createArtistDto: CreateArtistDto): Promise<BaseArtistResponse>;
    updateProfileProflePicture(file: any, id: number): Promise<BaseArtistResponse>;
    findAllArtists(): Promise<BaseArtistResponse[]>;
    findArtistById(id: number): Promise<BaseArtistResponse>;
    updateArtistBasicInfo(id: number, body: UpdateArtistDto): Promise<BaseArtistResponse>;
    follow(id: number, request: any): Promise<boolean>;
    unfollow(id: number, request: any): Promise<boolean>;
    findArtistFollowers(id: number): Promise<FollowerDto[]>;
}
