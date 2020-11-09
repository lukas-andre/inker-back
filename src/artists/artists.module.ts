import { Module } from '@nestjs/common';
import { ArtistsService } from './services/artists.service';
import { ArtistsController } from './controllers/artists.controller';
import { Artist } from './entities/artist.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistsHandler } from './handlers/artists.handler';
import { MultimediasModule } from 'src/multimedias/multimedias.module';

@Module({
  imports: [TypeOrmModule.forFeature([Artist], 'artist-db'), MultimediasModule],
  providers: [ArtistsService, ArtistsHandler],
  controllers: [ArtistsController],
  exports: [ArtistsService],
})
export class ArtistsModule {}
