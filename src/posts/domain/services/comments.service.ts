import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '../../../global/domain/services/base.service';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';
import { Comment } from '../../../posts/infrastructure/entities/comment.entity';
import {
  Repository,
  FindManyOptions,
  FindConditions,
  FindOneOptions,
  DeepPartial,
  DeleteResult,
} from 'typeorm';

@Injectable()
export class CommentsService extends BaseService {
  constructor(
    @InjectRepository(Comment, 'post-db')
    private readonly commentsRepository: Repository<Comment>,
  ) {
    super(CommentsService.name);
  }

  async findById(id: number): Promise<Comment> {
    return this.commentsRepository.findOne(id);
  }

  async find(
    options: FindManyOptions<Comment>,
  ): Promise<Comment[] | ServiceError> {
    try {
      return this.commentsRepository.find(options);
    } catch (error) {
      return this.serviceError(
        this.find,
        'Problems finding comments',
        error.message,
      );
    }
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

  async save(comment: DeepPartial<Comment>): Promise<Comment | ServiceError> {
    try {
      return this.commentsRepository.save(comment);
    } catch (error) {
      return this.serviceError(
        this.save,
        'Problems saving comment',
        error.message,
      );
    }
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.commentsRepository.delete(id);
  }
}
