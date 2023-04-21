import { Module } from '@nestjs/common';

import { ArtistsProviderModule } from '../artists/infrastructure/database/artistProvider.module';
import { UserProviderModule } from '../users/infrastructure/providers/userProvider.module';

import { FollowProviderModule } from './infrastructure/database/followProvider.module';
import { FollowsController } from './infrastructure/follows.controller';
import { FollowsHandler } from './infrastructure/follows.handler';
import { FindFollowersUseCase } from './usecases/findFollowers.usecase';
import { FindFollowsUseCase } from './usecases/findFollows.usecase';
import { FollowUseCase } from './usecases/follow.usecase';
import { UnfollowUseCase } from './usecases/unfollow.usecase';

@Module({
  imports: [
    ArtistsProviderModule,
    UserProviderModule,
    FollowProviderModule,
    ArtistsProviderModule,
  ],
  controllers: [FollowsController],
  providers: [
    FollowsHandler,
    FindFollowersUseCase,
    FindFollowsUseCase,
    FollowUseCase,
    UnfollowUseCase,
  ],
})
export class FollowsModule {}
