import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindManyOptions,
  FindConditions,
  FindOneOptions,
  DeepPartial,
  DeleteResult,
} from 'typeorm';
import { Comment } from '../../../posts/infrastructure/entities/comment.entity';

@Injectable()
export class CommentsService {
  private readonly serviceName: string = CommentsService.name;

  constructor(
    @InjectRepository(Comment, 'post-db')
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async findById(id: string) {
    return await this.commentsRepository.findOne(id);
  }

  async find(options: FindManyOptions<Comment>) {
    return await this.commentsRepository.find(options);
  }

  async findByKey(findConditions: FindConditions<Comment>) {
    return await this.commentsRepository.find({
      select: ['id', 'location', 'profileThumbnail', 'username', 'content'],
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<Comment>) {
    return await this.commentsRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<Comment>,
  ): Promise<Comment | undefined> {
    return await this.commentsRepository.findOne(options);
  }

  async save(artist: DeepPartial<Comment>): Promise<Comment> {
    return await this.commentsRepository.save(artist);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.commentsRepository.delete(id);
  }
}
