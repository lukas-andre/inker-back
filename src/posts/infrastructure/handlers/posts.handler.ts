import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../../global/domain/interfaces/jwtPayload.interface';
import { BaseHandler } from '../../../global/infrastructure/base.handler';
import { ArtistUploadPostUseCase } from '../../usescases/artistUploadPost.usecase';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { CreatePostDto } from '../dtos/createPost.dto';
import { ListAllArtistPostsQueryDto } from '../dtos/listAllArtistPostQuery.dto';
import { PaginationDto } from '../../../global/infrastructure/dtos/pagination.dto';
import { GetAllArtistPostsUseCase } from '../../../posts/usescases/getAllArtistPosts.usecase';

@Injectable()
export class PostsHandler extends BaseHandler {
  constructor(
    private readonly uploadPostUseCase: ArtistUploadPostUseCase,
    private readonly getAllArtistPostsUseCase: GetAllArtistPostsUseCase,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  public async handleCreatePost(
    files: FileInterface[],
    dto: CreatePostDto,
    request: any,
  ) {
    const jwtPayload: JwtPayload = this.getJwtPayloadFromRequest(request);
    return this.resolve(
      await this.uploadPostUseCase.execute(jwtPayload, files, dto),
    );
  }

  public async listArtistPostByUserId(
    userId: number,
    query: ListAllArtistPostsQueryDto,
    pagination: PaginationDto,
  ) {
    return this.resolve(
      await this.getAllArtistPostsUseCase.execute(userId, query, pagination),
    );
  }
}
