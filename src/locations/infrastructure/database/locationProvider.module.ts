import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtistLocation } from '../entities/artistLocation.entity';
import { EventLocation } from '../entities/eventLocation.entity';

import { ArtistLocationProvider } from './artistLocation.provider';
import { EventLocationProvider } from './eventLocation.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArtistLocation, EventLocation], 'location-db'),
  ],
  providers: [ArtistLocationProvider, EventLocationProvider],
  exports: [ArtistLocationProvider, EventLocationProvider],
})
export class LocationProviderModule {}
