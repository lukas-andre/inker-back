import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import { BaseComponent } from '../../../global/domain/components/base.component';
import { DBServiceFindException } from '../../../global/infrastructure/exceptions/dbService.exception';
import { Activity } from '../../infrastructure/entities/activity.entity';
import { FindReactionAndReactionTypeGroup } from '../interfaces/findReactionAndReactionTypeGroup.interface';

@Injectable()
export class ActivitiesService extends BaseComponent {
  constructor(
    @InjectRepository(Activity, 'reaction-db')
    private readonly activitiesRepository: Repository<Activity>,
  ) {
    super(ActivitiesService.name);
  }

  async findById(id: number) {
    return this.activitiesRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<Activity>) {
    return this.activitiesRepository.find(options);
  }

  async findByKey(
    findConditions: FindOptionsWhere<Activity>,
    select: (keyof Activity)[],
  ) {
    return this.activitiesRepository.find({
      select,
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<Activity>) {
    return this.activitiesRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<Activity>,
  ): Promise<Activity | undefined> {
    return this.activitiesRepository.findOne(options);
  }

  async findAllWithTotalReactionsAndReactionGroup(
    activityId?: number,
    activityType?: string,
  ): Promise<FindReactionAndReactionTypeGroup | undefined> {
    try {
      return await this.activitiesRepository
        .createQueryBuilder('activities')
        .select('COUNT(activities.reactions)', 'totalReactions')
        .addSelect('activities.activity_type', 'activityType')
        .addSelect('activities.activity_id', 'activityId')
        .addSelect(
          `array_to_string(array_agg(activities.reaction_type ORDER BY activities.reactions DESC), ',') AS reactions`,
        )
        .where('activities.activity_id = :activityId', {
          activityId,
        })
        .andWhere('activities.activity_type = :activityType', {
          activityType,
        })
        .andWhere('activities.reactions > 0')
        .groupBy('activities.activity_id, activities.activity_type ')
        .getRawOne();
    } catch (error) {
      throw new DBServiceFindException(
        this,
        'Problems finding activity',
        error,
      );
    }
  }

  async save(artist: DeepPartial<Activity>): Promise<Activity> {
    return this.activitiesRepository.save(artist);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.activitiesRepository.delete(id);
  }
}
