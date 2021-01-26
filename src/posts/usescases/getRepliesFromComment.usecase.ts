import { Injectable, Logger } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { PaginationDto } from '../../global/infrastructure/dtos/pagination.dto';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { CommentsService } from '../domain/services/comments.service';
import { Comment } from '../infrastructure/entities/comment.entity';
import { ParentCommentEnum } from '../infrastructure/enum/parentComment.enum';

@Injectable()
export class GetRepliesFromCommentUseCase {
  private readonly logger = new Logger(GetRepliesFromCommentUseCase.name);

  constructor(private readonly commentsService: CommentsService) {}

  async execute(
    commentId: number,
    pagination: PaginationDto,
  ): Promise<Comment[] | DomainException> {
    const comments = await this.commentsService.find({
      where: {
        partenId: commentId,
        parentType: ParentCommentEnum.COMMENT,
      },
      take: pagination.limit,
      skip: pagination.offset,
    });

    if (!comments.length) {
      return new DomainNotFoundException('Artist Dont have posts');
    }

    return comments;
  }
}
