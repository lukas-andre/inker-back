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
import {
  DBServiceFindException,
  DBServiceSaveException,
} from '../../../global/infrastructure/exceptions/dbService.exception';
import { Comment } from '../../infrastructure/entities/comment.entity';

@Injectable()
export class CommentsService extends BaseComponent {
  constructor(
    @InjectRepository(Comment, 'post-db')
    private readonly commentsRepository: Repository<Comment>,
  ) {
    super(CommentsService.name);
  }

  async findById(id: string): Promise<Comment> {
    return this.commentsRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<Comment>): Promise<Comment[]> {
    try {
      return this.commentsRepository.find(options);
    } catch (error) {
      throw new DBServiceFindException(this, 'Problems finding comment', error);
    }
  }

  async findByKey(findConditions: FindOptionsWhere<Comment>) {
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
    try {
      return this.commentsRepository.save(comment);
    } catch (error) {
      throw new DBServiceSaveException(this, 'Problems saving comment', error);
    }
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.commentsRepository.delete(id);
  }
}
