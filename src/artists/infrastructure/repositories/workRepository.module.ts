import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TagsRepositoryModule } from '../../../tags/tagsRespository.module';
import { Work } from '../entities/work.entity';

import { WorkRepository } from './work.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Work], 'artist-db'),
    TagsRepositoryModule,
  ],
  providers: [WorkRepository],
  exports: [WorkRepository],
})
export class WorkRepositoryModule {}
