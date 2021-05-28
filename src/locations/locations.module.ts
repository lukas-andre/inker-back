import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventLocation } from './infrastructure/entities/eventLocation.entity';
import { ArtistLocation } from './infrastructure/entities/artistLocation.entity';
import { ArtistLocationsService } from './domain/artistLocations.service';
import { EventLocationsService } from './domain/eventLocations.service';
import { LocationsCrontoller } from './infrastructure/locations.controller';
import { LocationsHandler } from './infrastructure/locations.handler';
import { AddLocationByApiUseCase } from './usescases/addLocationByApi.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArtistLocation, EventLocation], 'location-db'),
  ],
  controllers: [LocationsCrontoller],
  providers: [
    LocationsHandler,
    ArtistLocationsService,
    EventLocationsService,
    AddLocationByApiUseCase,
  ],
  exports: [ArtistLocationsService, EventLocationsService],
})
export class LocationsModule {}
