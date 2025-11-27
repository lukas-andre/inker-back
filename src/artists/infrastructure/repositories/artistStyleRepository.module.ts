import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtistStyle } from '../entities/artistStyle.entity';

import { ArtistStyleRepository } from './artistStyle.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ArtistStyle], 'artist-db')],
  providers: [ArtistStyleRepository],
  exports: [ArtistStyleRepository],
})
export class ArtistStyleProviderModule {}
