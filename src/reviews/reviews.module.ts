import { Module } from '@nestjs/common';

import { AgendaRepositoryModule } from '../agenda/infrastructure/repositories/agendaRepository.module';
import { ArtistsRepositoryModule } from '../artists/infrastructure/repositories/artistRepository.module';

import { ReviewRepositoryModule } from './database/reviewRepository.module';
import { ReviewsController } from './reviews.controller';
import { ReviewHandler } from './reviews.handler';
import { GetReviewsFromArtistUsecase } from './usecases/getReviewsFromArtist.usecase';
import { RatingArtistUsecase } from './usecases/ratingArtist.usecase';
import { ReactToReviewUsecase } from './usecases/reactToReview.usecase';
import { SyncQueueModule } from '../queues/sync/sync.queue.module';
import { UserRepositoryModule } from '../users/infrastructure/repositories/userRepository.module';

@Module({
  imports: [
    AgendaRepositoryModule,
    ReviewRepositoryModule,
    ArtistsRepositoryModule,
    UserRepositoryModule,
    SyncQueueModule,
  ],
  controllers: [ReviewsController],
  providers: [
    ReviewHandler,
    RatingArtistUsecase,
    ReactToReviewUsecase,
    GetReviewsFromArtistUsecase,
  ],
})
export class ReviewsModule {}
