import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import { BaseHandler } from '../../global/infrastructure/base.handler';
import { ReactToActivityUseCase } from '../usecases/reactToActivity.usecase';
import { ReactionToActivityResponseDto } from './reactionToActivityResponse.dto';
import { ReactionToActivityDto } from './reactionToActivity.dto';
import { GetReactionsDetailByActivityUseCase } from '../usecases/getReactionsDetailByActivity.usecase';
import { GetActivityReactionsResumeUseCase } from '../usecases/getActivityReactionsResume.usecase';

@Injectable()
export class ReactionsHandler extends BaseHandler {
  constructor(
    private readonly reactToActivityUseCase: ReactToActivityUseCase,
    private readonly getReactionsDetailByActivityUseCase: GetReactionsDetailByActivityUseCase,
    private readonly getActivityReactionsResumeUseCase: GetActivityReactionsResumeUseCase,
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
      await this.getReactionsDetailByActivityUseCase.execute(
        jwtPayload,
        activityId,
        activity,
      ),
    );
  }

  async handleGetActivityReactionsResume(
    activityId: number,
    activity: string,
    request: any,
  ): Promise<ReactionToActivityResponseDto> {
    const jwtPayload: JwtPayload = this.getJwtPayloadFromRequest(request);
    return this.resolve(
      await this.getActivityReactionsResumeUseCase.execute(
        jwtPayload,
        activityId,
        activity,
      ),
    );
  }
}
