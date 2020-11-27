import { Module } from '@nestjs/common';
import { ArtistsService } from './use_cases/services/artists.service';
import { ArtistsController } from './infrastructure/controllers/artists.controller';
import { Artist } from './infrastructure/entities/artist.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistsHandler } from './use_cases/artists.handler';
import { MultimediasModule } from '../multimedias/multimedias.module';

@Module({
  imports: [TypeOrmModule.forFeature([Artist], 'artist-db'), MultimediasModule],
  providers: [ArtistsService, ArtistsHandler],
  controllers: [ArtistsController],
  exports: [ArtistsService],
})
export class ArtistsModule {}
