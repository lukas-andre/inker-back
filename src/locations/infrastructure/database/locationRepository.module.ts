import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtistLocation } from './entities/artistLocation.entity';
import { EventLocation } from './entities/eventLocation.entity';

import { ArtistLocationRepository } from './artistLocation.repository';
import { EventLocationProvider } from './eventLocation.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArtistLocation, EventLocation], 'location-db'),
  ],
  providers: [ArtistLocationRepository, EventLocationProvider],
  exports: [ArtistLocationRepository, EventLocationProvider],
})
export class LocationRepositoryModule {}
