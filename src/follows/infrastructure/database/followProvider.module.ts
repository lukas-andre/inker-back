import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Followed } from '../entities/followed.entity';
import { Following } from '../entities/following.entity';

import { FollowedsRepository } from './followeds.repository';
import { FollowingsRepository } from './followings.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Followed, Following], 'follow-db')],
  providers: [FollowedsRepository, FollowingsRepository],
  exports: [FollowedsRepository, FollowingsRepository],
})
export class FollowProviderModule {}
