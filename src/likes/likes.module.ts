import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesService } from './domain/services/activities.service';
import { LikesService } from './domain/services/likes.service';
import { Activity } from './infrastructure/entities/activity.entity';
import { Like } from './infrastructure/entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Activity], 'like-db')],
  controllers: [],
  providers: [LikesService, ActivitiesService],
  exports: [],
})
export class LikesModule {}
