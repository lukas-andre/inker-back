import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { ArtistsModule } from './artists/artists.module';
import { GlobalModule } from './global/global.module';
import { MultimediasModule } from './multimedias/multimedias.module';
import { FollowsModule } from './follows/follows.module';
import { LikesModule } from './likes/likes.module';
import { PostsModule } from './posts/posts.module';
import { GenresModule } from './genres/genres.module';
import { TagsModule } from './tags/tags.module';
import { DatabasesModule } from './databases/database.module';

@Module({
  imports: [
    GlobalModule,
    DatabasesModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    ArtistsModule,
    MultimediasModule,
    FollowsModule,
    LikesModule,
    PostsModule,
    TagsModule,
    GenresModule,
    // FeedModule,
    // NotificationsModule,
  ],
  providers: [],
})
export class AppModule {}
