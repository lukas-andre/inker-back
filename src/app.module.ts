import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { ArtistsModule } from './artists/artists.module';
import { GlobalModule } from './global/global.module';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { MultimediasModule } from './multimedias/multimedias.module';
import { FollowsModule } from './follows/follows.module';

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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'customer-db',
      useFactory: (configService: ConfigService) => {
        console.log('customerDB', configService.get('customerDb'));
        return configService.get('customerDb');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'artist-db',
      useFactory: (configService: ConfigService) => {
        console.log('artistDb', configService.get('artistDb'));
        return configService.get('artistDb');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'follow-db',
      useFactory: (configService: ConfigService) => {
        console.log('followDB', configService.get('followDb'));
        return configService.get('followDb');
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CustomersModule,
    ArtistsModule,
    MultimediasModule,
    FollowsModule,
    // FeedModule,
    // PostsModule,
    // NotificationsModule,
  ],
  providers: [],
})
export class AppModule {}
