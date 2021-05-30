import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { DomainConflictException } from '../../global/domain/exceptions/domainConflict.exception';
import { isServiceError } from '../../global/domain/guards/isServiceError.guard';
import { PostsService } from '../domain/services/posts.service';
import { MultimediasService } from '../../multimedias/services/multimedias.service';
import { Post } from '../infrastructure/entities/post.entity';
import { FileInterface } from '../../multimedias/interfaces/file.interface';
import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import { CreatePostDto } from '../infrastructure/dtos/createPost.dto';
import { ArtistsService } from '../../artists/domain/services/artists.service';
import { TagsService } from '../../tags/tags.service';
import { GenresService } from '../../genres/genres.service';
import { GenrerInterface } from '../../genres/genre.interface';
import { TagInterface } from '../../tags/tag.interface';
import * as stringify from 'json-stringify-safe';

@Injectable()
export class ArtistUploadPostUseCase extends BaseUseCase {
  constructor(
    private readonly postService: PostsService,
    private readonly artistsService: ArtistsService,
    private readonly genresService: GenresService,
    private readonly tagsService: TagsService,
    private readonly multimediasService: MultimediasService,
  ) {
    super(ArtistUploadPostUseCase.name);
  }

  public async execute(
    jwtPayload: JwtPayload,
    files: FileInterface[],
    createPostDto: CreatePostDto,
  ): Promise<Post | DomainException> {
    if (!files) {
      return new DomainNotFoundException('Not valid files to upload');
    }

    const artist = await this.artistsService.findById(jwtPayload.userTypeId);
    if (isServiceError(artist)) {
      return new DomainConflictException(this.handleServiceError(artist));
    }

    if (!artist) {
      return new DomainNotFoundException('Artist not found');
    }

    const genres: GenrerInterface[] = [],
      tags: TagInterface[] = [];
    try {
      await Promise.all([
        this.genresService.handlePostGenres(createPostDto, genres),
        this.tagsService.handlePostTags(createPostDto, tags),
      ]);
    } catch (error) {
      // TODO: Not Handled Error
      this.logger.log(
        `Not Handled Error: ${stringify(error)} Message: ${error.message}`,
      );
    }

    console.log('genres: ', genres);
    console.log('tags: ', tags);

    let post = await this.postService.save({
      content: createPostDto.content,
      location: createPostDto.location,
      profileThumbnail: jwtPayload.profileThumbnail,
      genres: genres ? genres : [{}],
      tags: tags ? tags : [{}],
      userId: jwtPayload.id,
      userTypeId: jwtPayload.userTypeId,
      userType: jwtPayload.userType,
      username: jwtPayload.username,
    });

    if (isServiceError(post)) {
      return new DomainConflictException(this.handleServiceError(post));
    }

    post.multimedia = await this.multimediasService.handlePostMultimedias(
      files,
      jwtPayload.userTypeId,
      post.id,
    );

    post = await this.postService.save(post);

    return isServiceError(post)
      ? new DomainConflictException(this.handleServiceError(post))
      : post;
  }
}
