import { Module } from '@nestjs/common';

import { AgendaRepositoryModule } from '../agenda/infrastructure/repositories/agendaRepository.module';
import { ArtistsRepositoryModule } from '../artists/infrastructure/repositories/artistRepository.module';
import { SyncQueueModule } from '../queues/sync/sync.queue.module';
import { UserRepositoryModule } from '../users/infrastructure/repositories/userRepository.module';

import { ReviewRepositoryModule } from './database/reviewRepository.module';
import { ReviewsController } from './reviews.controller';
import { ReviewHandler } from './reviews.handler';
import { GetReviewsFromArtistUsecase } from './usecases/getReviewsFromArtist.usecase';
import { ReactToReviewUsecase } from './usecases/reactToReview.usecase';

@Module({
  imports: [
    AgendaRepositoryModule,
    ReviewRepositoryModule,
    ArtistsRepositoryModule,
    UserRepositoryModule,
    SyncQueueModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewHandler, ReactToReviewUsecase, GetReviewsFromArtistUsecase],
  exports: [],
})
export class ReviewsModule {}
