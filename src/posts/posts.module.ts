import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtistsModule } from '../artists/artists.module';
import { ArtistsProviderModule } from '../artists/infrastructure/database/artistProvider.module';
import { GenresModule } from '../genres/genres.module';
import { MultimediasModule } from '../multimedias/multimedias.module';

import { CommentsService } from './domain/services/comments.service';
import { PostsService } from './domain/services/posts.service';
import { CommentsController } from './infrastructure/controllers/comments.controller';
import { PostsController } from './infrastructure/controllers/posts.controller';
import { Comment } from './infrastructure/entities/comment.entity';
import { Post } from './infrastructure/entities/post.entity';
import { CommentsHandler } from './infrastructure/handlers/comments.handler';
import { PostsHandler } from './infrastructure/handlers/posts.handler';
import { ArtistUploadPostUseCase } from './usecases/artistUploadPost.usecase';
import { GetAllArtistPostsUseCase } from './usecases/getAllArtistPosts.usecase';
import { UserAddCommentUseCase } from './usecases/userAddComment.usecase';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [
    ArtistsProviderModule,
    TypeOrmModule.forFeature([Post, Comment], 'post-db'),
    ArtistsModule,
    MultimediasModule,
    GenresModule,
    TagsModule
  ],
  providers: [
    PostsService,
    PostsHandler,
    CommentsService,
    CommentsController,
    CommentsHandler,
    UserAddCommentUseCase,
    ArtistUploadPostUseCase,
    GetAllArtistPostsUseCase,
  ],
  controllers: [PostsController, CommentsController],
})
export class PostsModule {}
