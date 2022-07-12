import { forwardRef, Module } from '@nestjs/common';
import { ArtistsModule } from '../artists/artists.module';
import { ArtistsDbModule } from '../artists/infrastructure/database/artistDb.module';
import { LocationDbModule } from './infrastructure/database/locationDb.module';
import { LocationsController } from './infrastructure/locations.controller';
import { LocationsHandler } from './infrastructure/locations.handler';
import { AddLocationByApiUseCase } from './usecases/addLocationByApi.usecase';
import { FindArtistByRangeUseCase } from './usecases/findArtistByRange.usecase';

@Module({
  imports: [ArtistsDbModule, LocationDbModule, forwardRef(() => ArtistsModule)],
  controllers: [LocationsController],
  providers: [
    LocationsHandler,
    AddLocationByApiUseCase,
    FindArtistByRangeUseCase,
  ],
})
export class LocationsModule {}
