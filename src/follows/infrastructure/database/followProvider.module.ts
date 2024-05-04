import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Followed } from '../entities/followed.entity';
import { Following } from '../entities/following.entity';

import { FollowedsProvider } from './followeds.provider';
import { FollowingsProvider } from './followings.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Followed, Following], 'follow-db')],
  providers: [FollowedsProvider, FollowingsProvider],
  exports: [FollowedsProvider, FollowingsProvider],
})
export class FollowProviderModule {}
