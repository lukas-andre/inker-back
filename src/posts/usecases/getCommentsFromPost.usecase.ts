import { Injectable } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { PaginationDto } from '../../global/infrastructure/dtos/pagination.dto';
import { CommentsService } from '../domain/services/comments.service';
import { Comment } from '../infrastructure/entities/comment.entity';
import { ParentCommentEnum } from '../infrastructure/enum/parentComment.enum';

@Injectable()
export class GetCommentsFromPostUseCase extends BaseUseCase {
  constructor(private readonly commentsService: CommentsService) {
    super(GetCommentsFromPostUseCase.name);
  }

  async execute(
    postId: number,
    pagination: PaginationDto,
  ): Promise<Comment[] | DomainException> {
    const comments = await this.commentsService.find({
      where: {
        parentId: postId,
        parentType: ParentCommentEnum.POST,
      },
      take: pagination.limit,
      skip: pagination.offset,
    });

    if (isServiceError(comments)) {
      return new DomainConflictException(this.handleServiceError(comments));
    }

    return comments.length ? [] : comments;
  }
}
