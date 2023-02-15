import { Module } from '@nestjs/common';

import { AgendaProviderModule } from '../agenda/infrastructure/providers/agendaProvider.module';
import { ArtistsDbModule } from '../artists/infrastructure/database/artistDb.module';
import { UserProviderModule } from '../users/infrastructure/providers/userProvider.module';

import { ReviewProviderModule } from './database/reviewProvider.module';
import { ReviewsController } from './reviews.controller';
import { ReviewHandler } from './reviews.handler';
import { RatingArtistUsecase } from './usecases/ratingArtist.usecase';
import { ReactToReviewUsecase } from './usecases/reactToReview.usecase';

@Module({
  imports: [
    AgendaProviderModule,
    ReviewProviderModule,
    ArtistsDbModule,
    UserProviderModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewHandler, RatingArtistUsecase, ReactToReviewUsecase],
})
export class ReviewsModule {}
