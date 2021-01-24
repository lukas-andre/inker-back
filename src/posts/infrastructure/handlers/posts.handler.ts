import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UploadPostUseCase } from '../../../posts/usescases/uploadPost.usecase';
import { JwtPayload } from '../../../global/domain/interfaces/jwtPayload.interface';
import { BaseHandler } from '../../../global/infrastructure/base.handler';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { CreatePostDto } from '../dtos/createPost.dto';

@Injectable()
export class PostsHandler extends BaseHandler {
  constructor(
    private readonly uploadPostUseCase: UploadPostUseCase,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  async handleCreatePost(
    files: FileInterface[],
    dto: CreatePostDto,
    request: any,
  ) {
    const jwtPayload: JwtPayload = this.getJwtPayloadFromRequest(request);
    console.log('jwtPayload: ', jwtPayload);
    return this.resolve(
      await this.uploadPostUseCase.execute(jwtPayload, files, dto),
    );
  }
}
