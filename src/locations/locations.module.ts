import { forwardRef, Module } from '@nestjs/common';

import { ArtistsModule } from '../artists/artists.module';
import { ArtistsProviderModule } from '../artists/infrastructure/database/artistProvider.module';
import { ReviewProviderModule } from '../reviews/database/reviewProvider.module';

import { LocationDbModule } from './infrastructure/database/locationDb.module';
import { LocationsController } from './infrastructure/locations.controller';
import { LocationsHandler } from './infrastructure/locations.handler';
import { AddLocationByApiUseCase } from './usecases/addLocationByApi.usecase';
import { FindArtistByRangeUseCase } from './usecases/findArtistByRange.usecase';

@Module({
  imports: [
    ArtistsProviderModule,
    LocationDbModule,
    forwardRef(() => ArtistsModule),
    ReviewProviderModule,
  ],
  controllers: [LocationsController],
  providers: [
    LocationsHandler,
    AddLocationByApiUseCase,
    FindArtistByRangeUseCase,
  ],
})
export class LocationsModule {}
