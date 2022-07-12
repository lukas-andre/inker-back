import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { PaginationDto } from '../../../global/infrastructure/dtos/pagination.dto';
import {
  DBServiceFindException,
  DBServiceSaveException,
} from '../../../global/infrastructure/exceptions/dbService.exception';
import { Post } from '../../../posts/infrastructure/entities/post.entity';

@Injectable()
export class PostsService extends BaseComponent {
  constructor(
    @InjectRepository(Post, 'post-db')
    private readonly postsRepository: Repository<Post>,
  ) {
    super(PostsService.name);
  }

  async findById(id: number) {
    return this.postsRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<Post>) {
    return this.postsRepository.find(options);
  }

  async findByKey(findConditions: FindOptionsWhere<Post>) {
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

  async save(post: DeepPartial<Post>): Promise<Post> {
    try {
      return await this.postsRepository.save(post);
    } catch (error) {
      throw new DBServiceSaveException(this, 'Trouble saving post', error);
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
  ): Promise<Post[]> {
    try {
      const qb = this.postsRepository
        .createQueryBuilder('posts')
        .select('posts')
        .where('posts.userId = :userId', { userId })
        .orderBy('posts.created_at');

      if (genres?.length) {
        qb.andWhere('genres @> :genres', {
          genres: JSON.stringify(genres.map(genre => ({ name: genre }))),
        });
      }

      if (tags?.length) {
        qb.andWhere('tags @> :tags', {
          tags: JSON.stringify(tags.map(tag => ({ name: tag }))),
        });
      }

      return await qb
        .limit(pagination.limit)
        .offset(pagination.offset)
        .getMany();
    } catch (error) {
      throw new DBServiceFindException(this, 'Trouble finding posts', error);
    }
  }
}
