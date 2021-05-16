import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../../posts/infrastructure/entities/post.entity';
import {
  Repository,
  FindManyOptions,
  FindConditions,
  FindOneOptions,
  DeepPartial,
  DeleteResult,
} from 'typeorm';

@Injectable()
export class PostsService {
  private readonly serviceName: string = PostsService.name;

  constructor(
    @InjectRepository(Post, 'post-db')
    private readonly postsRepository: Repository<Post>,
  ) {}

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

  async save(post: DeepPartial<Post>): Promise<Post> {
    return this.postsRepository.save(post);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.postsRepository.delete(id);
  }
}
