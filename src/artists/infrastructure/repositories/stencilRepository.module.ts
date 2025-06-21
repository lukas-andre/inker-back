import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TagsRepositoryModule } from '../../../tags/tagsRespository.module';
import { Stencil } from '../entities/stencil.entity';

import { StencilRepository } from './stencil.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stencil], 'artist-db'),
    TagsRepositoryModule,
  ],
  providers: [StencilRepository],
  exports: [StencilRepository],
})
export class StencilRepositoryModule {}
