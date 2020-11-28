import { CreateArtistDto } from './dtos/createArtist.dto';
import { CreateArtistUseCase } from '../usecases/createArtist.usecase';
import { FindArtistsUseCases } from '../usecases/findArtist.usecases';
import { UpdateArtistProfilePictureUseCase } from '../usecases/updateArtistProfilePicture.usecase';
import { BaseArtistResponse } from './dtos/baseArtistResponse.dto';
import { UpdateArtistDto } from './dtos/updateArtist.dto';
import { UpdateArtistBasicInfoUseCase } from '../usecases/updateArtstBasicInfo.usecase';
import { JwtService } from '@nestjs/jwt';
export declare class ArtistsHandler {
    private readonly createArtistUseCase;
    private readonly findArtistsUseCases;
    private readonly updateArtistProfilePictureUseCase;
    private readonly updateArtistBasicInfoUseCase;
    private readonly jwtService;
    constructor(createArtistUseCase: CreateArtistUseCase, findArtistsUseCases: FindArtistsUseCases, updateArtistProfilePictureUseCase: UpdateArtistProfilePictureUseCase, updateArtistBasicInfoUseCase: UpdateArtistBasicInfoUseCase, jwtService: JwtService);
    handleCreate(dto: CreateArtistDto): Promise<BaseArtistResponse>;
    handleUpdateProfileProflePicture(id: string, file: any): Promise<BaseArtistResponse>;
    handleFindById(id: string): Promise<BaseArtistResponse>;
    handleGetAll(): Promise<BaseArtistResponse[]>;
    handleUpdateArtistBasicInfo(id: string, dto: UpdateArtistDto): Promise<BaseArtistResponse>;
    private resolve;
    handleFollow(id: string, request: any): Promise<void>;
}
