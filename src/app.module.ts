import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { ArtistsModule } from './artists/artists.module';
import { FeedModule } from './feed/feed.module';
import { PostsModule } from './posts/posts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GlobalModule } from './global/global.module';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    GlobalModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'user-db',
      useFactory: (configService: ConfigService) => {
        console.log(configService.get('userDb'));
        return configService.get('userDb');
      },
      inject: [ConfigService],
    }),
    // AuthModule,
    UsersModule,
    // CustomersModule,
    // ArtistsModule,
    // FeedModule,
    // PostsModule,
    // NotificationsModule,
  ],
  providers: [],
})
export class AppModule {}
