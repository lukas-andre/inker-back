import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stencil } from '../entities/stencil.entity';
import { StencilRepository } from './stencil.repository';
import { TagsRepositoryModule } from '../../../tags/tagsRespository.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stencil], 'artist-db'),
    TagsRepositoryModule
  ],
  providers: [StencilRepository],
  exports: [StencilRepository],
})
export class StencilRepositoryModule {}