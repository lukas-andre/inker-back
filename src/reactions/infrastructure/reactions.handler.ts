import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/global/domain/interfaces/jwtPayload.interface';
import { BaseHandler } from 'src/global/infrastructure/base.handler';
import { ReactToActivityUseCase } from '../usecases/reactToActivity.usecase';
import { ReactionToActivityResponseDto } from './reactionToActivityResponse.dto';
import { ReactionToActivityDto } from './reactionToActivity.dto';

@Injectable()
export class ReactionsHandler extends BaseHandler {
  constructor(
    private readonly reactToActivityUseCase: ReactToActivityUseCase,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  async handleReaction(
    dto: ReactionToActivityDto,
    request: any,
  ): Promise<ReactionToActivityResponseDto> {
    console.log('dto: ', dto);
    const jwtPayload: JwtPayload = this.getJwtPayloadFromRequest(request);
    return this.resolve(
      await this.reactToActivityUseCase.execute(jwtPayload, dto),
    );
  }
}
