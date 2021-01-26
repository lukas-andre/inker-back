import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistsModule } from '../artists/artists.module';
import { GenresModule } from '../genres/genres.module';
import { MultimediasModule } from '../multimedias/multimedias.module';
import { TagsModule } from '../tags/tags.module';
import { CommentsService } from './domain/services/comments.service';
import { PostsService } from './domain/services/posts.service';
import { CommentsController } from './infrastructure/controllers/comments.controller';
import { PostsController } from './infrastructure/controllers/posts.controller';
import { Comment } from './infrastructure/entities/comment.entity';
import { Post } from './infrastructure/entities/post.entity';
import { CommentsHandler } from './infrastructure/handlers/comments.handler';
import { PostsHandler } from './infrastructure/handlers/posts.handler';
import { ArtistUploadPostUseCase } from './usescases/artistUploadPost.usecase';
import { GetAllArtistPostsUseCase } from './usescases/getAllArtistPosts.usecase';
import { UserAddCommentUseCase } from './usescases/userAddComment.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment], 'post-db'),
    ArtistsModule,
    MultimediasModule,
    GenresModule,
    TagsModule,
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
