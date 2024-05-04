import { Module } from '@nestjs/common';

import { AgendaProviderModule } from '../agenda/infrastructure/providers/agendaProvider.module';
import { ArtistsProviderModule } from '../artists/infrastructure/database/artistProvider.module';
import { UserProviderModule } from '../users/infrastructure/providers/userProvider.module';

import { ReviewProviderModule } from './database/reviewProvider.module';
import { ReviewsController } from './reviews.controller';
import { ReviewHandler } from './reviews.handler';
import { GetReviewsFromArtistUsecase } from './usecases/getReviewsFromArtist.usecase';
import { RatingArtistUsecase } from './usecases/ratingArtist.usecase';
import { ReactToReviewUsecase } from './usecases/reactToReview.usecase';

@Module({
  imports: [
    AgendaProviderModule,
    ReviewProviderModule,
    ArtistsProviderModule,
    UserProviderModule,
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
