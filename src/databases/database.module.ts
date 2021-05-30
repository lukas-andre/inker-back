import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'user-db',
      useFactory: (configService: ConfigService) => {
        return configService.get('userDb');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'customer-db',
      useFactory: (configService: ConfigService) => {
        return configService.get('customerDb');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'artist-db',
      useFactory: (configService: ConfigService) => {
        return configService.get('artistDb');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'follow-db',
      useFactory: (configService: ConfigService) => {
        return configService.get('followDb');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'reaction-db',
      useFactory: (configService: ConfigService) => {
        return configService.get('reactionDb');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'post-db',
      useFactory: (configService: ConfigService) => {
        return configService.get('postDb');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'genre-db',
      useFactory: (configService: ConfigService) => {
        return configService.get('genreDb');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'tag-db',
      useFactory: (configService: ConfigService) => {
        return configService.get('tagDb');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'agenda-db',
      useFactory: (configService: ConfigService) => {
        return configService.get('agendaDb');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'location-db',
      useFactory: (configService: ConfigService) => {
        return configService.get('locationDb');
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabasesModule {}
