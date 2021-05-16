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

@Injectable()
export class ArtistUploadPostUseCase {
  private readonly logger = new Logger(ArtistUploadPostUseCase.name);

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
      return new DomainInternalServerErrorException(`Error: ${error.message}`);
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
      this.logger.log(JSON.stringify(error));
    }

    console.log('genres: ', genres);
    console.log('tags: ', tags);
    const newPost: DeepPartial<Post> = {
      content: createPostDto.content,
      location: createPostDto.location,
      profileThumbnail: jwtPayload.profileThumbnail,
      genres: genres ? genres : [{}],
      tags: tags ? tags : [{}],
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
