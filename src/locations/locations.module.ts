import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistsModule } from '../artists/artists.module';
import { ArtistsDatabaseModule } from '../artists/infrastructure/database/artistDatabase.module';
import { ArtistLocationsService } from './domain/artistLocations.service';
import { EventLocationsService } from './domain/eventLocations.service';
import { ArtistLocation } from './infrastructure/entities/artistLocation.entity';
import { EventLocation } from './infrastructure/entities/eventLocation.entity';
import { LocationsController } from './infrastructure/locations.controller';
import { LocationsHandler } from './infrastructure/locations.handler';
import { AddLocationByApiUseCase } from './usecases/addLocationByApi.usecase';
import { FindArtistByRangeUseCase } from './usecases/findArtistByRange.usecase';

@Module({
  imports: [
    ArtistsDatabaseModule,
    TypeOrmModule.forFeature([ArtistLocation, EventLocation], 'location-db'),
    forwardRef(() => ArtistsModule),
  ],
  controllers: [LocationsController],
  providers: [
    LocationsHandler,
    ArtistLocationsService,
    EventLocationsService,
    AddLocationByApiUseCase,
    FindArtistByRangeUseCase,
  ],
  exports: [ArtistLocationsService, EventLocationsService],
})
export class LocationsModule {}
