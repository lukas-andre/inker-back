import { Injectable } from '@nestjs/common';
import { ArtistsService } from '../../artists/domain/services/artists.service';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { CommentsService } from '../domain/services/comments.service';
import { PostsService } from '../domain/services/posts.service';
import { CreateCommentDto } from '../infrastructure/dtos/createComment.dto';
import { Comment } from '../infrastructure/entities/comment.entity';
import { ParentCommentEnum } from '../infrastructure/enum/parentComment.enum';

@Injectable()
export class UserAddCommentUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly artistsService: ArtistsService,
    private readonly postsService: PostsService,
  ) {
    super(UserAddCommentUseCase.name);
  }

  public async execute(
    jwtPayload: JwtPayload,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment | DomainException> {
    const artist = await this.artistsService.findById(jwtPayload.userTypeId);

    if (isServiceError(artist)) {
      return new DomainConflictException(artist);
    }

    if (!artist) {
      return new DomainNotFoundException('Artists not found');
    }

    if (
      !(await this.validParent(
        createCommentDto.parentId,
        createCommentDto.parentType,
      ))
    ) {
      return new DomainNotFoundException('Comment parent is not valid');
    }

    const savedComment = await this.commentsService.save({
      content: createCommentDto.content,
      location: createCommentDto.location,
      parentType: ParentCommentEnum[createCommentDto.parentType],
      parentId: createCommentDto.parentId,
      profileThumbnail: jwtPayload.profileThumbnail,
      userType: jwtPayload.userType,
      userTypeId: jwtPayload.userTypeId,
      userId: jwtPayload.userTypeId,
      username: jwtPayload.username,
    });

    return isServiceError(savedComment)
      ? new DomainConflictException(this.handleServiceError(savedComment))
      : savedComment;
  }

  private async validParent(
    parentId: number,
    parentType: ParentCommentEnum,
  ): Promise<boolean> {
    let validParent = false;
    switch (parentType) {
      case ParentCommentEnum.COMMENT:
        validParent =
          (await this.commentsService.count({
            where: { id: parentId },
            cache: true,
          })) > 0
            ? true
            : false;
        break;
      case ParentCommentEnum.POST:
        validParent =
          (await this.postsService.count({
            where: { id: parentId },
            cache: true,
          })) > 0
            ? true
            : false;
        break;
      default:
        validParent = false;
        break;
    }
    return validParent;
  }
}
