import { Injectable } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { PaginationDto } from '../../global/infrastructure/dtos/pagination.dto';
import { CommentsService } from '../domain/services/comments.service';
import { Comment } from '../infrastructure/entities/comment.entity';
import { ParentCommentEnum } from '../infrastructure/enum/parentComment.enum';

@Injectable()
export class GetRepliesFromCommentUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(private readonly commentsService: CommentsService) {
    super(GetRepliesFromCommentUseCase.name);
  }

  async execute(
    commentId: number,
    pagination: PaginationDto,
  ): Promise<Comment[] | DomainException> {
    const replies = await this.commentsService.find({
      where: {
        parentId: commentId,
        parentType: ParentCommentEnum.COMMENT,
      },
      take: pagination.limit,
      skip: pagination.offset,
    });

    if (isServiceError(replies)) {
      return new DomainConflictException(this.handleServiceError(replies));
    }

    return replies.length ? replies : [];
  }
}
