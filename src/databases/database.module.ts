import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

export const USER_DB_CONNECTION_NAME = 'user-db';
export const USER_DB_CONFIG_NAME = 'userDb';

export const CUSTOMER_DB_CONNECTION_NAME = 'customer-db';
export const CUSTOMER_DB_CONFIG_NAME = 'customerDb';

export const ARTIST_DB_CONNECTION_NAME = 'artist-db';
export const ARTIST_DB_CONFIG_NAME = 'artistDb';

export const FOLLOW_DB_CONNECTION_NAME = 'follow-db';
export const FOLLOW_DB_CONFIG_NAME = 'followDb';

export const REACTION_DB_CONNECTION_NAME = 'reaction-db';
export const REACTION_DB_CONFIG_NAME = 'reactionDb';

export const POST_DB_CONNECTION_NAME = 'post-db';
export const POST_DB_CONFIG_NAME = 'postDb';

export const GENRE_DB_CONNECTION_NAME = 'genre-db';
export const GENRE_DB_CONFIG_NAME = 'genreDb';

export const TAG_DB_CONNECTION_NAME = 'tag-db';
export const TAG_DB_CONFIG_NAME = 'tagDb';

export const AGENDA_DB_CONNECTION_NAME = 'agenda-db';
export const AGENDA_DB_CONFIG_NAME = 'agendaDb';

export const LOCATION_DB_CONNECTION_NAME = 'location-db';
export const LOCATION_DB_CONFIG_NAME = 'locationDb';

export const CUSTOMER_FEED_DB_CONNECTION_NAME = 'customer-feed-db';
export const CUSTOMER_FEED_DB_CONFIG_NAME = 'customerFeedDb';

export const REVIEW_DB_CONNECTION_NAME = 'review-db';
export const REVIEW_DB_CONFIG_NAME = 'reviewDb';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: USER_DB_CONNECTION_NAME,
      useFactory: (configService: ConfigService) =>
        configService.get(USER_DB_CONFIG_NAME),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: CUSTOMER_DB_CONNECTION_NAME,
      useFactory: (configService: ConfigService) =>
        configService.get(CUSTOMER_DB_CONFIG_NAME),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: ARTIST_DB_CONNECTION_NAME,
      useFactory: (configService: ConfigService) =>
        configService.get(ARTIST_DB_CONFIG_NAME),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: FOLLOW_DB_CONNECTION_NAME,
      useFactory: (configService: ConfigService) =>
        configService.get(FOLLOW_DB_CONFIG_NAME),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: REACTION_DB_CONNECTION_NAME,
      useFactory: (configService: ConfigService) =>
        configService.get(REACTION_DB_CONFIG_NAME),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: POST_DB_CONNECTION_NAME,
      useFactory: (configService: ConfigService) =>
        configService.get(POST_DB_CONFIG_NAME),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: GENRE_DB_CONNECTION_NAME,
      useFactory: (configService: ConfigService) =>
        configService.get(GENRE_DB_CONFIG_NAME),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: TAG_DB_CONNECTION_NAME,
      useFactory: (configService: ConfigService) =>
        configService.get(TAG_DB_CONFIG_NAME),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: AGENDA_DB_CONNECTION_NAME,
      useFactory: (configService: ConfigService) =>
        configService.get(AGENDA_DB_CONFIG_NAME),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: LOCATION_DB_CONNECTION_NAME,
      useFactory: (configService: ConfigService) =>
        configService.get(LOCATION_DB_CONFIG_NAME),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: CUSTOMER_FEED_DB_CONNECTION_NAME,
      useFactory: (configService: ConfigService) =>
        configService.get(CUSTOMER_FEED_DB_CONFIG_NAME),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: REVIEW_DB_CONNECTION_NAME,
      useFactory: (configService: ConfigService) =>
        configService.get(REVIEW_DB_CONFIG_NAME),
      inject: [ConfigService],
    }),
  ],
})
export class DatabasesModule {}
