import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from '../../infrastructure/entities/activity.entity';
import {
  Repository,
  FindManyOptions,
  FindConditions,
  FindOneOptions,
  DeepPartial,
  DeleteResult,
} from 'typeorm';
import { FindReactionAndReactionTypeGroup } from '../interfaces/findReactionAndReactionTypeGroup.interface';

@Injectable()
export class ActivitiesService {
  private readonly serviceName: string = ActivitiesService.name;

  constructor(
    @InjectRepository(Activity, 'reaction-db')
    private readonly acitivitiesRepository: Repository<Activity>,
  ) {}

  async findById(id: string) {
    return await this.acitivitiesRepository.findOne(id);
  }

  async find(options: FindManyOptions<Activity>) {
    return await this.acitivitiesRepository.find(options);
  }

  async findByKey(
    findConditions: FindConditions<Activity>,
    select: (keyof Activity)[],
  ) {
    return await this.acitivitiesRepository.find({
      select,
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<Activity>) {
    return await this.acitivitiesRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<Activity>,
  ): Promise<Activity | undefined> {
    return await this.acitivitiesRepository.findOne(options);
  }

  async findAllWithTotalReactionsAndReactionGroup(
    activityId?: number,
    activityType?: string,
  ): Promise<FindReactionAndReactionTypeGroup | undefined> {
    return (await this.acitivitiesRepository
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
      .getRawOne()) as FindReactionAndReactionTypeGroup;
  }

  async save(artist: DeepPartial<Activity>): Promise<Activity> {
    return await this.acitivitiesRepository.save(artist);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.acitivitiesRepository.delete(id);
  }
}
