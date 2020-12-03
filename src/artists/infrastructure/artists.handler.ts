import { Injectable } from '@nestjs/common';
import { CreateArtistDto } from './dtos/createArtist.dto';
import { CreateArtistUseCase } from '../usecases/createArtist.usecase';
import { FindArtistsUseCases } from '../usecases/findArtist.usecases';
import { UpdateArtistProfilePictureUseCase } from '../usecases/updateArtistProfilePicture.usecase';
import { BaseArtistResponse } from './dtos/baseArtistResponse.dto';
import { UpdateArtistDto } from './dtos/updateArtist.dto';
import { UpdateArtistBasicInfoUseCase } from '../usecases/updateArtstBasicInfo.usecase';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import { FollowerDto } from './dtos/follow.dto';
import { FollowUseCase } from '../usecases/followArtist.usecase';
import { UnfollowArtistUseCase } from '../usecases/unfollowArtist.usecase';
import { BaseHandler } from 'src/global/infrastructure/base.handler';
import { FindArtistFollowersUseCase } from '../usecases/findArtistFollowers.usecase';
@Injectable()
export class ArtistsHandler extends BaseHandler {
  constructor(
    private readonly createArtistUseCase: CreateArtistUseCase,
    private readonly findArtistsUseCases: FindArtistsUseCases,
    private readonly updateArtistProfilePictureUseCase: UpdateArtistProfilePictureUseCase,
    private readonly updateArtistBasicInfoUseCase: UpdateArtistBasicInfoUseCase,
    private readonly followUseCase: FollowUseCase,
    private readonly unfollowArtistUseCase: UnfollowArtistUseCase,
    private readonly findArtistFollowersUseCase: FindArtistFollowersUseCase,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  async handleCreate(dto: CreateArtistDto): Promise<BaseArtistResponse> {
    return this.resolve(await this.createArtistUseCase.execute(dto));
  }

  async handleUpdateProfileProflePicture(
    id: number,
    file: any,
  ): Promise<BaseArtistResponse> {
    return this.resolve(
      await this.updateArtistProfilePictureUseCase.execute(id, file),
    );
  }

  async handleFindById(id: number): Promise<BaseArtistResponse> {
    return this.resolve(await this.findArtistsUseCases.findById(id));
  }
  async handleGetAll(): Promise<BaseArtistResponse[]> {
    return this.findArtistsUseCases.findAll({});
  }

  async handleUpdateArtistBasicInfo(
    id: number,
    dto: UpdateArtistDto,
  ): Promise<BaseArtistResponse> {
    return this.resolve(
      await this.updateArtistBasicInfoUseCase.execute(id, dto),
    );
  }

  async handleFollow(id: number, request): Promise<boolean> {
    const jwtPayload: JwtPayload = this.getJwtPayloadFromRequest(request);
    const params: FollowerDto = {
      userId: jwtPayload.id,
      userTypeId: jwtPayload.userTypeId,
      userType: jwtPayload.userType,
      username: jwtPayload.username,
      fullname: jwtPayload.fullname,
      profileThumbnail: jwtPayload.profileThumbnail
        ? jwtPayload.profileThumbnail
        : '',
    };

    return this.resolve(await this.followUseCase.execute(id, params));
  }

  async handleUnfollow(id: number, request): Promise<boolean> {
    const jwtPayload: JwtPayload = this.getJwtPayloadFromRequest(request);
    return this.resolve(
      await this.unfollowArtistUseCase.execute(id, jwtPayload.id),
    );
  }

  async handleFindArtistFollowers(id: number): Promise<FollowerDto[]> {
    return this.resolve(
      await this.findArtistFollowersUseCase.execute(id),
    );
  }
}
