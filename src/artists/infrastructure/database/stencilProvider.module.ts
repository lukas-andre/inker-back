import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stencil } from '../entities/stencil.entity';
import { StencilProvider } from './stencil.provider';
import { TagsModule } from '../../../tags/tags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stencil], 'artist-db'),
    TagsModule
  ],
  providers: [StencilProvider],
  exports: [StencilProvider],
})
export class StencilProviderModule {}