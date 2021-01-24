import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genrer } from './genre.entity';
import { GenresService } from './genres.service';

@Module({
  imports: [TypeOrmModule.forFeature([Genrer], 'genre-db')],
  providers: [GenresService],
  exports: [GenresService],
})
export class GenresModule {}
