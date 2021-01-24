import { Injectable, Logger } from '@nestjs/common';
import { MultimediasService } from '../../multimedias/services/multimedias.service';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DomainNotFoundException } from '../../global/domain/exceptions/domainNotFound.exception';
import { DomainInternalServerErrorException } from '../../global/domain/exceptions/domainInternalServerError.exception';
import { PostsService } from '../domain/services/posts.service';
import { Post } from '../infrastructure/entities/post.entity';
import { FileInterface } from '../../multimedias/interfaces/file.interface';
import { JwtPayload } from '../../global/domain/interfaces/jwtPayload.interface';
import { CreatePostDto } from '../infrastructure/dtos/createPost.dto';
import { ArtistsService } from '../../artists/domain/services/artists.service';
import { Artist } from '../../artists/infrastructure/entities/artist.entity';
import { DeepPartial } from 'typeorm';
import { TagsService } from '../../tags/tags.service';
import { GenresService } from '../../genres/genres.service';
import { GenrerInterface } from '../../genres/genre.interface';
import { TagInterface } from '../../tags/tag.interface';
import { MultimediasMetadaInterface } from '../../multimedias/interfaces/multimediasMetadata.interface copy';

@Injectable()
export class UploadPostUseCase {
  private readonly logger = new Logger(UploadPostUseCase.name);

  constructor(
    private readonly postService: PostsService,
    private readonly artistsService: ArtistsService,
    private readonly genresService: GenresService,
    private readonly tagsService: TagsService,
    private readonly multimediasService: MultimediasService,
  ) {}

  async execute(
    jwtPayload: JwtPayload,
    files: FileInterface[],
    createPostDto: CreatePostDto,
  ): Promise<Post | DomainException> {
    if (!files) {
      return new DomainNotFoundException('Not valid files to upload');
    }

    let artist: Artist;
    try {
      artist = await this.artistsService.findById(jwtPayload.userTypeId);
    } catch (error) {
      return new DomainInternalServerErrorException(`Error: ${error}`);
    }

    if (!artist) {
      return new DomainNotFoundException('Artists not found');
    }

    const genresEntities: GenrerInterface[] = [],
      tagsEntities: TagInterface[] = [];
    try {
      await Promise.all([
        this.genresService.handlePostGenres(createPostDto, genresEntities),
        this.tagsService.handlePostTags(createPostDto, tagsEntities),
      ]);
    } catch (error) {
      this.logger.log(JSON.stringify(error));
    }

    const newPost: DeepPartial<Post> = {
      content: createPostDto.content,
      location: createPostDto.location,
      profileThumbnail: createPostDto.profileThumbnail,
      genres: genresEntities,
      tags: tagsEntities,
      userId: jwtPayload.id,
      userTypeId: jwtPayload.userTypeId,
      userType: jwtPayload.userType,
      username: jwtPayload.username,
    };

    const post = await this.postService.save(newPost);

    post.multimedia = await this.multimediasService.handlePostMultimedias(
      files,
      jwtPayload.userTypeId,
      post.id,
    );

    return this.postService.save(post);
  }
}
