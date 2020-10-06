import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CustomersModule } from './customers/customers.module';
import { ArtistsModule } from './artists/artists.module';
import { FeedModule } from './feed/feed.module';
import { PostsModule } from './posts/posts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GlobalModule } from './global/global.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    GlobalModule,
    TypeOrmModule.forRootAsync({
      name: 'user-db',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('userDb'),
    }),
    AuthModule,
    UserModule,
    CustomersModule,
    ArtistsModule,
    FeedModule,
    PostsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
