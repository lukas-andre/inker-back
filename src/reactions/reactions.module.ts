import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesService } from './domain/services/activities.service';
import { ReactionsService } from './domain/services/reactions.service';
import { Activity } from './infrastructure/entities/activity.entity';
import { Reaction } from './infrastructure/entities/reaction.entity';
import { ReactionsController } from './infrastructure/reactions.controller';
import { ReactionsHandler } from './infrastructure/reactions.handler';
import { GetReactionsDetailByActivity } from './usecases/getReactionsDetailByActivity.usecase copy';
import { ReactToActivityUseCase } from './usecases/reactToActivity.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction, Activity], 'reaction-db')],
  controllers: [ReactionsController],
  providers: [
    ReactionsService,
    ActivitiesService,
    ReactToActivityUseCase,
    GetReactionsDetailByActivity,
    ReactionsHandler,
  ],
  exports: [],
})
export class ReactionsModule {}
