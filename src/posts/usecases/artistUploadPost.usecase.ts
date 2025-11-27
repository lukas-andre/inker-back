import { Injectable } from '@nestjs/common';
import stringify from 'fast-safe-stringify';

import { ArtistRepository } from '../../artists/infrastructure/repositories/artist.repository';
import { GenreInterface } from '../../genres/genre.interface';
import { GenresService } from '../../genres/genres.service';
import {
  DomainBadRequest,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { FileInterface } from '../../multimedias/interfaces/file.interface';
import { MultimediasService } from '../../multimedias/services/multimedias.service';
import { TagInterface } from '../../tags/tag.interface';
import { TagsRepository } from '../../tags/tags.service';
import { PostsService } from '../domain/services/posts.service';
import { CreatePostDto } from '../infrastructure/dtos/createPost.dto';
import { Post } from '../infrastructure/entities/post.entity';

@Injectable()
export class ArtistUploadPostUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly postService: PostsService,
    private readonly artistProvider: ArtistRepository,
    private readonly genresService: GenresService,
    private readonly tagsService: TagsRepository,
    private readonly multimediasService: MultimediasService,
  ) {
    super(ArtistUploadPostUseCase.name);
  }

  public async execute(
    jwtPayload: JwtPayload,
    files: FileInterface[],
    createPostDto: CreatePostDto,
  ): Promise<Post> {
    if (!files) {
      throw new DomainBadRequest('Not valid files to upload');
    }

    const artist = await this.artistProvider.findById(jwtPayload.userTypeId);

    if (!artist) {
      throw new DomainNotFound('Artist not found');
    }

    const genres: GenreInterface[] = [],
      tags: TagInterface[] = [];
    try {
      await Promise.all([
        this.genresService.handlePostGenres(createPostDto, genres),
        this.tagsService.handlePostTags(createPostDto, tags),
      ]);
    } catch (error) {
      // TODO: Not Handled Error
      this.logger.log(
        `Not Handled Error: ${stringify(error)} Message: ${
          (error as Error).message
        }`,
      );
    }

    console.log('genres: ', genres);
    console.log('tags: ', tags);

    const post = await this.postService.save({
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

    post.multimedia = await this.multimediasService.handlePostMultimedias(
      files,
      jwtPayload.userTypeId,
      post.id,
    );

    return this.postService.save(post);
  }
}
