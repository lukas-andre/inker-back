import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Tag } from './tag.entity';
import { TagsRepository } from './tags.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tag], 'artist-db')],
  providers: [TagsRepository],
  exports: [TagsRepository],
})
export class TagsRepositoryModule {}
