import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import { BaseHandler } from '../../global/infrastructure/base.handler';
import { FollowerDto } from '../../artists/infrastructure/dtos/follow.dto';
import { UnfollowUseCase } from '../usecases/unfollow.usecase';
import { FindFollowersUseCase } from '../usecases/findFollowers.usecase';
import { FindFollowsUseCase } from '../usecases/findFollows.usecase';
import { FollowUseCase } from '../usecases/follow.usecase';
import { FollowingType } from '../domain/types/followingType';

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

  async handleFollow(userId: number, request): Promise<boolean> {
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

    return this.resolve(await this.followUseCase.execute(userId, follower));
  }

  async handleUnfollow(id: number, request): Promise<boolean> {
    const jwtPayload: JwtPayload = this.getJwtPayloadFromRequest(request);
    return this.resolve(await this.unfollowUseCase.execute(id, jwtPayload.id));
  }

  async handleFindArtistFollowers(
    artistUserId: number,
  ): Promise<FollowerDto[]> {
    return this.resolve(await this.findFollowersUseCase.execute(artistUserId));
  }

  async findArtistFollows(artistUserId: number): Promise<FollowingType[]> {
    return this.resolve(await this.findFollowsUseCase.execute(artistUserId));
  }
}
