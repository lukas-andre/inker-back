import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AGENDA_DB_CONFIG_NAME,
  AGENDA_DB_CONNECTION_NAME,
  ANALYTICS_DB_CONFIG_NAME,
  ANALYTICS_DB_CONNECTION_NAME,
  ARTIST_DB_CONFIG_NAME,
  ARTIST_DB_CONNECTION_NAME,
  CUSTOMER_DB_CONFIG_NAME,
  CUSTOMER_DB_CONNECTION_NAME,
  // CUSTOMER_FEED_DB_CONFIG_NAME,
  // CUSTOMER_FEED_DB_CONNECTION_NAME,
  FOLLOW_DB_CONFIG_NAME,
  FOLLOW_DB_CONNECTION_NAME,
  GENRE_DB_CONFIG_NAME,
  GENRE_DB_CONNECTION_NAME,
  LOCATION_DB_CONFIG_NAME,
  LOCATION_DB_CONNECTION_NAME,
  NOTIFICATIONS_DB_CONFIG_NAME,
  NOTIFICATIONS_DB_CONNECTION_NAME,
  POST_DB_CONFIG_NAME,
  POST_DB_CONNECTION_NAME,
  REACTION_DB_CONFIG_NAME,
  REACTION_DB_CONNECTION_NAME,
  REVIEW_DB_CONFIG_NAME,
  REVIEW_DB_CONNECTION_NAME,
  TAG_DB_CONFIG_NAME,
  TAG_DB_CONNECTION_NAME,
  USER_DB_CONFIG_NAME,
  USER_DB_CONNECTION_NAME,
} from './constants';

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
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   name: CUSTOMER_FEED_DB_CONNECTION_NAME,
    //   useFactory: (configService: ConfigService) =>
    //     configService.get(CUSTOMER_FEED_DB_CONFIG_NAME),
    //   inject: [ConfigService],
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: REVIEW_DB_CONNECTION_NAME,
      useFactory: (configService: ConfigService) =>
        configService.get(REVIEW_DB_CONFIG_NAME),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: NOTIFICATIONS_DB_CONNECTION_NAME,
      useFactory: (configService: ConfigService) =>
        configService.get(NOTIFICATIONS_DB_CONFIG_NAME),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: ANALYTICS_DB_CONNECTION_NAME,
      useFactory: (configService: ConfigService) =>
        configService.get(ANALYTICS_DB_CONFIG_NAME),
      inject: [ConfigService],
    }),
  ],
})
export class DatabasesModule {}
