import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Work } from '../entities/work.entity';
import { WorkProvider } from './work.provider';
import { TagsModule } from '../../../tags/tags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Work], 'artist-db'),
    TagsModule,
  ],
  providers: [WorkProvider],
  exports: [WorkProvider],
})
export class WorkProviderModule {}