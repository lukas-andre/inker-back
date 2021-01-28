import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import { BaseHandler } from '../../global/infrastructure/base.handler';
import { ReactToActivityUseCase } from '../usecases/reactToActivity.usecase';
import { ReactionToActivityResponseDto } from './reactionToActivityResponse.dto';
import { ReactionToActivityDto } from './reactionToActivity.dto';
import { GetReactionsDetailByActivity } from '../usecases/getReactionsDetailByActivity.usecase copy';

@Injectable()
export class ReactionsHandler extends BaseHandler {
  constructor(
    private readonly reactToActivityUseCase: ReactToActivityUseCase,
    private readonly getReactionsDetailByActivity: GetReactionsDetailByActivity,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  async handleReaction(
    dto: ReactionToActivityDto,
    request: any,
  ): Promise<ReactionToActivityResponseDto> {
    const jwtPayload: JwtPayload = this.getJwtPayloadFromRequest(request);
    return this.resolve(
      await this.reactToActivityUseCase.execute(jwtPayload, dto),
    );
  }

  async handleGetReactionsDetail(
    activityId: number,
    activity: string,
    request: any,
  ): Promise<ReactionToActivityResponseDto> {
    const jwtPayload: JwtPayload = this.getJwtPayloadFromRequest(request);
    return this.resolve(
      await this.getReactionsDetailByActivity.execute(
        jwtPayload,
        activityId,
        activity,
      ),
    );
  }
}
