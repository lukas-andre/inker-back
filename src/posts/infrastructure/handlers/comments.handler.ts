import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../../global/domain/interfaces/jwtPayload.interface';
import { BaseHandler } from '../../../global/infrastructure/base.handler';
import { UserAddCommentUseCase } from '../../usecases/userAddComment.usecase';
import { CreateCommentDto } from '../dtos/createComment.dto';

@Injectable()
export class CommentsHandler extends BaseHandler {
  constructor(
    private readonly userAddCommentUseCase: UserAddCommentUseCase,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  async handleCreateComment(dto: CreateCommentDto, request: any) {
    console.log('dto: ', dto);
    const jwtPayload: JwtPayload = this.getJwtPayloadFromRequest(request);
    return this.resolve(
      await this.userAddCommentUseCase.execute(jwtPayload, dto),
    );
  }
}
