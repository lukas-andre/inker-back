import { Injectable } from '@nestjs/common';
import { CreateArtistDto } from './dtos/createArtist.dto';
import { CreateArtistUseCase } from '../usecases/createArtist.usecase';
import { FindArtistsUseCases } from '../usecases/findArtist.usecases';
import { UpdateArtistProfilePictureUseCase } from '../usecases/updateArtistProfilePicture.usecase';
import { DomainException } from 'src/global/domain/exceptions/domain.exception';
import { resolveDomainException } from 'src/global/infrastructure/exceptions/resolveDomainException';
import { BaseArtistResponse } from './dtos/baseArtistResponse.dto';
import { UpdateArtistDto } from './dtos/updateArtist.dto';
import { UpdateArtistBasicInfoUseCase } from '../usecases/updateArtstBasicInfo.usecase';
// import { FollowDto } from './dtos/follow.dto';
import { JwtService } from '@nestjs/jwt';
import { ExtractJwt } from 'passport-jwt';
import { JwtPayload } from 'src/global/domain/interfaces/jwtPayload.interface';
import { FollowerDto } from './dtos/follow.dto';
import { FollowUseCase } from '../usecases/followArtist.usecase';
import { UnfollowArtistUseCase } from '../usecases/unfollowArtist.usecase';
import { BaseHandler } from 'src/global/infrastructure/base.handler';
@Injectable()
export class ArtistsHandler extends BaseHandler {
  constructor(
    private readonly createArtistUseCase: CreateArtistUseCase,
    private readonly findArtistsUseCases: FindArtistsUseCases,
    private readonly updateArtistProfilePictureUseCase: UpdateArtistProfilePictureUseCase,
    private readonly updateArtistBasicInfoUseCase: UpdateArtistBasicInfoUseCase,
    private readonly followUseCase: FollowUseCase,
    private readonly unfollowArtistUseCase: UnfollowArtistUseCase,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  async handleCreate(dto: CreateArtistDto): Promise<BaseArtistResponse> {
    return this.resolve(await this.createArtistUseCase.execute(dto));
  }

  async handleUpdateProfileProflePicture(
    id: string,
    file: any,
  ): Promise<BaseArtistResponse> {
    return this.resolve(
      await this.updateArtistProfilePictureUseCase.execute(id, file),
    );
  }

  async handleFindById(id: string): Promise<BaseArtistResponse> {
    return this.findArtistsUseCases.findById(id);
  }
  async handleGetAll(): Promise<BaseArtistResponse[]> {
    return this.findArtistsUseCases.findAll({});
  }

  async handleUpdateArtistBasicInfo(
    id: string,
    dto: UpdateArtistDto,
  ): Promise<BaseArtistResponse> {
    return this.resolve(
      await this.updateArtistBasicInfoUseCase.execute(id, dto),
    );
  }



  async handleFollow(id: string, request): Promise<boolean> {
    const jwtPayload: JwtPayload = this.getJwtPayloadFromRequest(request);
    const params: FollowerDto = {
      userId: jwtPayload.id,
      userTypeId: jwtPayload.userTypeId,
      username: jwtPayload.username,
      profileThumbnail: jwtPayload.profileThumbnail
        ? jwtPayload.profileThumbnail
        : '',
    };

    return this.resolve(
      await this.followUseCase.execute(id, params),
    );
  }

  
  async handleUnfollow(id: string, request): Promise<boolean> {
    const jwtPayload: JwtPayload = this.getJwtPayloadFromRequest(request);
    return this.resolve(
      await this.unfollowArtistUseCase.execute(id, jwtPayload.id),
    );
  }
}
