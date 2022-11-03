import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtistLocation } from '../entities/artistLocation.entity';
import { EventLocation } from '../entities/eventLocation.entity';

import { ArtistLocationsDbService } from './services/artistLocationsDb.service';
import { EventLocationsDbService } from './services/eventLocationsDb.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArtistLocation, EventLocation], 'location-db'),
  ],
  providers: [ArtistLocationsDbService, EventLocationsDbService],
  exports: [ArtistLocationsDbService, EventLocationsDbService],
})
export class LocationDbModule {}
