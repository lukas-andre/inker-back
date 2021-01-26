import { Injectable, Logger } from '@nestjs/common';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { DomainInternalServerErrorException } from '../../global/domain/exceptions/domainInternalServerError.exception';
import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import { ArtistsService } from '../../artists/domain/services/artists.service';
import { Artist } from '../../artists/infrastructure/entities/artist.entity';
import { DeepPartial } from 'typeorm';
import { CreateCommentDto } from '../infrastructure/dtos/createComment.dto';
import { Comment } from '../infrastructure/entities/comment.entity';
import { ParentCommentEnum } from '../infrastructure/enum/parentComment.enum';
import { CommentsService } from '../domain/services/comments.service';
import { PostsService } from '../domain/services/posts.service';

@Injectable()
export class UserAddCommentUseCase {
  private readonly logger = new Logger(UserAddCommentUseCase.name);

  constructor(
    private readonly commentsService: CommentsService,
    private readonly artistsService: ArtistsService,
    private readonly postsService: PostsService,
  ) {}

  public async execute(
    jwtPayload: JwtPayload,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment | DomainException> {
    let artist: Artist;

    try {
      artist = await this.artistsService.findById(jwtPayload.userTypeId);
    } catch (error) {
      return new DomainInternalServerErrorException(`Error: ${error}`);
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

    const newComment: DeepPartial<Comment> = {
      content: createCommentDto.content,
      location: createCommentDto.location,
      parentType: ParentCommentEnum[createCommentDto.parentType],
      partenId: createCommentDto.parentId,
      profileThumbnail: jwtPayload.profileThumbnail,
      userType: jwtPayload.userType,
      userTypeId: jwtPayload.userTypeId,
      userId: jwtPayload.userTypeId,
      username: jwtPayload.username,
    };

    return await this.commentsService.save(newComment);
  }

  private async validParent(
    parentId: number,
    parentType: ParentCommentEnum,
  ): Promise<boolean> {
    let validParent = false;
    switch (parentType) {
      case ParentCommentEnum.COMMENT:
        const existsComment = await this.commentsService.count({
          where: { id: parentId },
          cache: true,
        });
        validParent = existsComment > 0 ? true : false;
        break;
      case ParentCommentEnum.POST:
        const existsPost = await this.postsService.count({
          where: { id: parentId },
          cache: true,
        });
        validParent = existsPost > 0 ? true : false;
        break;
      default:
        validParent = false;
        break;
    }
    return validParent;
  }
}
