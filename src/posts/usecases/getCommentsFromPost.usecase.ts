import { Injectable } from '@nestjs/common';

import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { PaginationDto } from '../../global/infrastructure/dtos/pagination.dto';
import { CommentsService } from '../domain/services/comments.service';
import { Comment } from '../infrastructure/entities/comment.entity';
import { ParentCommentEnum } from '../infrastructure/enum/parentComment.enum';

@Injectable()
export class GetCommentsFromPostUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly commentsService: CommentsService) {
    super(GetCommentsFromPostUseCase.name);
  }

  async execute(postId: number, pagination: PaginationDto): Promise<Comment[]> {
    const comments = await this.commentsService.find({
      where: {
        parentId: postId,
        parentType: ParentCommentEnum.POST,
      },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return comments.length ? [] : comments;
  }
}
