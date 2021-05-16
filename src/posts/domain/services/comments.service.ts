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

  async findById(id: number): Promise<Comment> {
    return this.commentsRepository.findOne(id);
  }

  async find(options: FindManyOptions<Comment>): Promise<Comment[]> {
    return this.commentsRepository.find(options);
  }

  async findByKey(findConditions: FindConditions<Comment>) {
    return this.commentsRepository.find({
      select: ['id', 'location', 'profileThumbnail', 'username', 'content'],
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(
    options: FindManyOptions<Comment>,
  ): Promise<[Comment[], number]> {
    return this.commentsRepository.findAndCount(options);
  }

  async count(options: FindManyOptions<Comment>): Promise<number> {
    return this.commentsRepository.count(options);
  }

  async findOne(
    options?: FindOneOptions<Comment>,
  ): Promise<Comment | undefined> {
    return this.commentsRepository.findOne(options);
  }

  async save(comment: DeepPartial<Comment>): Promise<Comment> {
    return this.commentsRepository.save(comment);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.commentsRepository.delete(id);
  }
}
