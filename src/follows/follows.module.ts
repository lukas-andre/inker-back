import { Module } from '@nestjs/common';

import { ArtistsRepositoryModule } from '../artists/infrastructure/repositories/artistRepository.module';
import { UserRepositoryModule } from '../users/infrastructure/repositories/userRepository.module';

import { FollowProviderModule } from './infrastructure/database/followProvider.module';
import { FollowsController } from './infrastructure/follows.controller';
import { FollowsHandler } from './infrastructure/follows.handler';
import { FindFollowersUseCase } from './usecases/findFollowers.usecase';
import { FindFollowsUseCase } from './usecases/findFollows.usecase';
import { FollowUseCase } from './usecases/follow.usecase';
import { UnfollowUseCase } from './usecases/unfollow.usecase';

@Module({
  imports: [
    ArtistsRepositoryModule,
    UserRepositoryModule,
    FollowProviderModule,
    ArtistsRepositoryModule,
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
