import { Injectable, Logger } from '@nestjs/common';
import { PaginationDto } from '../../global/infrastructure/dtos/pagination.dto';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { ListAllArtistPostsQueryDto } from '../infrastructure/dtos/listAllArtistPostQuery.dto';
import { PostsService } from '../domain/services/posts.service';
import { Post } from '../infrastructure/entities/post.entity';

@Injectable()
export class GetAllArtistPostsUseCase {
  private readonly logger = new Logger(GetAllArtistPostsUseCase.name);

  constructor(private readonly postService: PostsService) {}

  async execute(
    userId: number,
    query: ListAllArtistPostsQueryDto,
    pagination: PaginationDto,
  ): Promise<Post[] | DomainException> {
    console.log('query: ', query);
    // TODO: MOVER ESTO A UN SERVICIO
    const qb = (await this.postService.createQueryBuilder('posts'))
      .select('posts')
      .where('posts.userId = :userId', { userId })
      .orderBy('posts.created_at');

    if (query.genres?.length) {
      qb.andWhere('genres @> :genres', {
        genres: JSON.stringify(query.genres.map((genre) => ({ name: genre }))),
      });
    }

    if (query.tags?.length) {
      qb.andWhere('tags @> :tags', {
        tags: JSON.stringify(query.tags.map((tag) => ({ name: tag }))),
      });
    }

    const post = await qb
      .limit(pagination.limit)
      .offset(pagination.offset)
      .getMany();

    console.log('posts: ', post);

    if (!post.length) {
      return new DomainNotFoundException('Artist Dont have posts');
    }

    return post;
  }
}

// select *  from post p
// WHERE P.genres @> '[{"name": "blackwork"}, {"name": "nuevo genero"}]'
