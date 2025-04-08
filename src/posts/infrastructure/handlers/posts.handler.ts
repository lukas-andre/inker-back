import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '../../../global/domain/interfaces/jwtPayload.interface';
import { BaseHandler } from '../../../global/infrastructure/base.handler';
import { PaginationDto } from '../../../global/infrastructure/dtos/pagination.dto';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { ArtistUploadPostUseCase } from '../../usecases/artistUploadPost.usecase';
import { GetAllArtistPostsUseCase } from '../../usecases/getAllArtistPosts.usecase';
import { CreatePostDto } from '../dtos/createPost.dto';
import { ListAllArtistPostsQueryDto } from '../dtos/listAllArtistPostQuery.dto';

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
    return this.uploadPostUseCase.execute(jwtPayload, files, dto);
  }

  public async listArtistPostByUserId(
    userId: string,
    query: ListAllArtistPostsQueryDto,
    pagination: PaginationDto,
  ) {
    return this.getAllArtistPostsUseCase.execute(userId, query, pagination);
  }
}
