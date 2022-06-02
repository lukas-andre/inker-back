import { Injectable } from '@nestjs/common';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import { PaginationDto } from '../../global/infrastructure/dtos/pagination.dto';
import { ListAllArtistPostsQueryDto } from '../infrastructure/dtos/listAllArtistPostQuery.dto';
import { PostsService } from '../domain/services/posts.service';
import { Post } from '../infrastructure/entities/post.entity';

@Injectable()
export class GetAllArtistPostsUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly postService: PostsService) {
    super(GetAllArtistPostsUseCase.name);
  }

  async execute(
    userId: number,
    query: ListAllArtistPostsQueryDto,
    pagination: PaginationDto,
  ): Promise<Post[] | DomainException> {
    const posts = await this.postService.findByUserId(
      userId,
      query.genres,
      query.tags,
      pagination,
    );

    if (isServiceError(posts)) {
      return new DomainConflictException(this.handleServiceError(posts));
    }

    return posts.length ? posts : [];
  }
}

// select *  from post p
// WHERE P.genres @> '[{"name": "blackwork"}, {"name": "nuevo genero"}]'
