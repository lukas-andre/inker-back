import { Module } from '@nestjs/common';

import { AgendaProviderModule } from '../agenda/infrastructure/providers/agendaProvider.module';
import { ArtistsDbModule } from '../artists/infrastructure/database/artistDb.module';
import { UsersModule } from '../users/users.module';

import { ReviewProviderModule } from './database/reviewProvider.module';
import { RatingsController } from './reviews.controller';
import { ReviewHandler } from './reviews.handler';
import { RatingArtistUsecase } from './usecases/ratingArtist.usecase';

@Module({
  imports: [
    ReviewProviderModule,
    ArtistsDbModule,
    AgendaProviderModule,
    // TODO: remove this dependency
    UsersModule,
  ],
  controllers: [RatingsController],
  providers: [ReviewHandler, RatingArtistUsecase],
})
export class ReviewsModule {}
