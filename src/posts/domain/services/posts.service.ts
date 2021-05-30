import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../../posts/infrastructure/entities/post.entity';
import { BaseService } from '../../../global/domain/services/base.service';
import { PaginationDto } from '../../../global/infrastructure/dtos/pagination.dto';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';
import {
  Repository,
  FindManyOptions,
  FindConditions,
  FindOneOptions,
  DeepPartial,
  DeleteResult,
} from 'typeorm';

@Injectable()
export class PostsService extends BaseService {
  constructor(
    @InjectRepository(Post, 'post-db')
    private readonly postsRepository: Repository<Post>,
  ) {
    super(PostsService.name);
  }

  async findById(id: number) {
    return this.postsRepository.findOne(id);
  }

  async find(options: FindManyOptions<Post>) {
    return this.postsRepository.find(options);
  }

  async findByKey(findConditions: FindConditions<Post>) {
    return this.postsRepository.find({
      select: ['id', 'location', 'profileThumbnail', 'username', 'content'],
      where: {
        ...findConditions,
      },
    });
  }
  async createQueryBuilder(alias: string) {
    return this.postsRepository.createQueryBuilder(alias);
  }

  async findAndCount(
    options: FindManyOptions<Post>,
  ): Promise<[Post[], number]> {
    return this.postsRepository.findAndCount(options);
  }

  async count(options: FindManyOptions<Post>): Promise<number> {
    return this.postsRepository.count(options);
  }

  async findOne(options?: FindOneOptions<Post>): Promise<Post | undefined> {
    return this.postsRepository.findOne(options);
  }

  async save(post: DeepPartial<Post>): Promise<Post | ServiceError> {
    try {
      return this.postsRepository.save(post);
    } catch (error) {
      return this.serviceError(
        this.save,
        'Problems saving post',
        error.message,
      );
    }
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.postsRepository.delete(id);
  }

  async findByUserId(
    userId: number,
    genres: string[],
    tags: string[],
    pagination: PaginationDto,
  ): Promise<Post[] | ServiceError> {
    try {
      const qb = this.postsRepository
        .createQueryBuilder('posts')
        .select('posts')
        .where('posts.userId = :userId', { userId })
        .orderBy('posts.created_at');

      if (genres?.length) {
        qb.andWhere('genres @> :genres', {
          genres: JSON.stringify(genres.map((genre) => ({ name: genre }))),
        });
      }

      if (tags?.length) {
        qb.andWhere('tags @> :tags', {
          tags: JSON.stringify(tags.map((tag) => ({ name: tag }))),
        });
      }

      return qb.limit(pagination.limit).offset(pagination.offset).getMany();
    } catch (error) {
      return this.serviceError(
        this.findByUserId,
        'Problems finding artists',
        error.message,
      );
    }
  }
}
