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

  async findById(id: string) {
    return await this.postsRepository.findOne(id);
  }

  async find(options: FindManyOptions<Post>) {
    return await this.postsRepository.find(options);
  }

  async findByKey(findConditions: FindConditions<Post>) {
    return await this.postsRepository.find({
      select: ['id', 'location', 'profileThumbnail', 'username', 'content'],
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<Post>) {
    return await this.postsRepository.findAndCount(options);
  }

  async findOne(options?: FindOneOptions<Post>): Promise<Post | undefined> {
    return await this.postsRepository.findOne(options);
  }

  async save(artist: DeepPartial<Post>): Promise<Post> {
    return await this.postsRepository.save(artist);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.postsRepository.delete(id);
  }
}
