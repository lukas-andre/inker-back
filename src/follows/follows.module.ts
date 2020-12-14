import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistsModule } from '../artists/artists.module';
import { UsersModule } from '../users/users.module';
import { FollowedsService } from './domain/services/followeds.service';
import { FollowingsService } from './domain/services/followings.service';
import { Followed } from './infrastructure/entities/followed.entity';
import { Following } from './infrastructure/entities/following.entity';
import { FollowsController } from './infrastructure/follows.controller';
import { FollowsHandler } from './infrastructure/follows.handler';
import { FindFollowersUseCase } from './usecases/findFollowers.usecase';
import { FindFollowsUseCase } from './usecases/findFollows.usecase';
import { FollowUseCase } from './usecases/follow.usecase';
import { UnfollowUseCase } from './usecases/unfollow.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([Followed, Following], 'follow-db'),
    forwardRef(() => UsersModule),
    forwardRef(() => ArtistsModule),
  ],
  controllers: [FollowsController],
  providers: [
    FollowsHandler,
    FollowedsService,
    FollowingsService,
    FindFollowersUseCase,
    FindFollowsUseCase,
    FollowUseCase,
    UnfollowUseCase,
  ],
  exports: [FollowedsService, FollowingsService],
})
export class FollowsModule {}
