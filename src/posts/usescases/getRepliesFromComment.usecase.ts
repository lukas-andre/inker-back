import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import { PaginationDto } from '../../global/infrastructure/dtos/pagination.dto';
import { CommentsService } from '../domain/services/comments.service';
import { Comment } from '../infrastructure/entities/comment.entity';
import { ParentCommentEnum } from '../infrastructure/enum/parentComment.enum';
@Injectable()
export class GetRepliesFromCommentUseCase extends BaseUseCase {
  constructor(private readonly commentsService: CommentsService) {
    super(GetRepliesFromCommentUseCase.name);
  }

  async execute(
    commentId: number,
    pagination: PaginationDto,
  ): Promise<Comment[] | DomainException> {
    const replies = await this.commentsService.find({
      where: {
        partenId: commentId,
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
