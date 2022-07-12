import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FollowerDto } from '../../artists/infrastructure/dtos/follow.dto';
import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import { BaseHandler } from '../../global/infrastructure/base.handler';
import { DefaultResponseDto } from '../../global/infrastructure/dtos/defaultResponse.dto';
import { FollowingType } from '../domain/types/followingType';
import { FindFollowersUseCase } from '../usecases/findFollowers.usecase';
import { FindFollowsUseCase } from '../usecases/findFollows.usecase';
import { FollowUseCase } from '../usecases/follow.usecase';
import { UnfollowUseCase } from '../usecases/unfollow.usecase';

@Injectable()
export class FollowsHandler extends BaseHandler {
  constructor(
    private readonly followUseCase: FollowUseCase,
    private readonly unfollowUseCase: UnfollowUseCase,
    private readonly findFollowersUseCase: FindFollowersUseCase,
    private readonly findFollowsUseCase: FindFollowsUseCase,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  async handleFollow(userId: number, request): Promise<DefaultResponseDto> {
    const jwtPayload: JwtPayload = this.getJwtPayloadFromRequest(request);
    const follower: FollowerDto = {
      userId: jwtPayload.id,
      userTypeId: jwtPayload.userTypeId,
      userType: jwtPayload.userType,
      username: jwtPayload.username,
      fullname: jwtPayload.fullname,
      profileThumbnail: jwtPayload.profileThumbnail
        ? jwtPayload.profileThumbnail
        : '',
    };

    return this.followUseCase.execute(userId, follower);
  }

  async handleUnfollow(id: number, request): Promise<DefaultResponseDto> {
    const jwtPayload: JwtPayload = this.getJwtPayloadFromRequest(request);
    return this.unfollowUseCase.execute(id, jwtPayload.id);
  }

  async handleFindArtistFollowers(
    artistUserId: number,
  ): Promise<FollowerDto[]> {
    return this.findFollowersUseCase.execute(artistUserId);
  }

  async findArtistFollows(artistUserId: number): Promise<FollowingType[]> {
    return this.findFollowsUseCase.execute(artistUserId);
  }
}
