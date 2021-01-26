import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  imports: [
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'reaction-db',
      useFactory: (configService: ConfigService) => {
        console.log('reactionDb', configService.get('reactionDb'));
        return configService.get('reactionDb');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'post-db',
      useFactory: (configService: ConfigService) => {
        console.log('postDb', configService.get('postDb'));
        return configService.get('postDb');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'genre-db',
      useFactory: (configService: ConfigService) => {
        console.log('genreDb', configService.get('genreDb'));
        return configService.get('genreDb');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'tag-db',
      useFactory: (configService: ConfigService) => {
        console.log('tagDb', configService.get('tagDb'));
        return configService.get('tagDb');
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabasesModule {}
