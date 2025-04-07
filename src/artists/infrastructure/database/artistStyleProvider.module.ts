import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistStyle } from '../entities/artistStyle.entity';
import { ArtistStyleProvider } from './artistStyle.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArtistStyle], 'artist-db'),
  ],
  providers: [ArtistStyleProvider],
  exports: [ArtistStyleProvider],
})
export class ArtistStyleProviderModule {}