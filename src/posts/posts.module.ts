import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistsModule } from '../artists/artists.module';
import { GenresModule } from '../genres/genres.module';
import { MultimediasModule } from '../multimedias/multimedias.module';
import { TagsModule } from '../tags/tags.module';
import { CommentsService } from './domain/services/comments.service';
import { PostsService } from './domain/services/posts.service';
import { PostsController } from './infrastructure/controllers/posts.controller';
import { Comment } from './infrastructure/entities/comment.entity';
import { Post } from './infrastructure/entities/post.entity';
import { PostsHandler } from './infrastructure/handlers/posts.handler';
import { UploadPostUseCase } from './usescases/uploadPost.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment], 'post-db'),
    ArtistsModule,
    MultimediasModule,
    GenresModule,
    TagsModule,
  ],
  providers: [PostsService, PostsHandler, CommentsService, UploadPostUseCase],
  controllers: [PostsController],
})
export class PostsModule {}
