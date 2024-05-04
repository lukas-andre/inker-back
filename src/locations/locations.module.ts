import { Module } from '@nestjs/common';

import { ArtistsProviderModule } from '../artists/infrastructure/database/artistProvider.module';
import { FollowProviderModule } from '../follows/infrastructure/database/followProvider.module';
import { ReviewProviderModule } from '../reviews/database/reviewProvider.module';

import { LocationProviderModule } from './infrastructure/database/locationProvider.module';
import { LocationsController } from './infrastructure/locations.controller';
import { LocationsHandler } from './infrastructure/locations.handler';
import { AddLocationByApiUseCase } from './usecases/addLocationByApi.usecase';
import { FindArtistByRangeUseCase } from './usecases/findArtistByRange.usecase';

@Module({
  imports: [
    ArtistsProviderModule,
    LocationProviderModule,
    ReviewProviderModule,
    FollowProviderModule,
  ],
  controllers: [LocationsController],
  providers: [
    LocationsHandler,
    AddLocationByApiUseCase,
    FindArtistByRangeUseCase,
  ],
})
export class LocationsModule {}
