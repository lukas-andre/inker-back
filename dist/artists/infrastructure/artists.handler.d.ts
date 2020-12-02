import { CreateArtistDto } from './dtos/createArtist.dto';
import { CreateArtistUseCase } from '../usecases/createArtist.usecase';
import { FindArtistsUseCases } from '../usecases/findArtist.usecases';
import { UpdateArtistProfilePictureUseCase } from '../usecases/updateArtistProfilePicture.usecase';
import { BaseArtistResponse } from './dtos/baseArtistResponse.dto';
import { UpdateArtistDto } from './dtos/updateArtist.dto';
import { UpdateArtistBasicInfoUseCase } from '../usecases/updateArtstBasicInfo.usecase';
import { JwtService } from '@nestjs/jwt';
import { FollowUseCase } from '../usecases/followArtist.usecase';
import { UnfollowArtistUseCase } from '../usecases/unfollowArtist.usecase';
import { BaseHandler } from 'src/global/infrastructure/base.handler';
export declare class ArtistsHandler extends BaseHandler {
    private readonly createArtistUseCase;
    private readonly findArtistsUseCases;
    private readonly updateArtistProfilePictureUseCase;
    private readonly updateArtistBasicInfoUseCase;
    private readonly followUseCase;
    private readonly unfollowArtistUseCase;
    private readonly jwtService;
    constructor(createArtistUseCase: CreateArtistUseCase, findArtistsUseCases: FindArtistsUseCases, updateArtistProfilePictureUseCase: UpdateArtistProfilePictureUseCase, updateArtistBasicInfoUseCase: UpdateArtistBasicInfoUseCase, followUseCase: FollowUseCase, unfollowArtistUseCase: UnfollowArtistUseCase, jwtService: JwtService);
    handleCreate(dto: CreateArtistDto): Promise<BaseArtistResponse>;
    handleUpdateProfileProflePicture(id: string, file: any): Promise<BaseArtistResponse>;
    handleFindById(id: string): Promise<BaseArtistResponse>;
    handleGetAll(): Promise<BaseArtistResponse[]>;
    handleUpdateArtistBasicInfo(id: string, dto: UpdateArtistDto): Promise<BaseArtistResponse>;
    handleFollow(id: string, request: any): Promise<boolean>;
    handleUnfollow(id: string, request: any): Promise<boolean>;
}
