import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventLocation } from './infrastructure/entities/eventLocation.entity';
import { ArtistLocation } from './infrastructure/entities/artistLocation.entity';
import { ArtistLocationsService } from './domain/artistLocations.service';
import { EventLocationsService } from './domain/eventLocations.service';
import { LocationsCrontoller } from './infrastructure/locations.controller';
import { LocationsHandler } from './infrastructure/locations.handler';
import { AddLocationByApiUseCase } from './usecases/addLocationByApi.usecase';
import { FindArtistByRangeUseCase } from './usecases/findArtistByRange.usecase';
import { ArtistsModule } from 'src/artists/artists.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArtistLocation, EventLocation], 'location-db'),
    ArtistsModule,
  ],
  controllers: [LocationsCrontoller],
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
