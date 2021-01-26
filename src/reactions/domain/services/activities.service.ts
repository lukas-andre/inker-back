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

  async findAll(
    options?: FindOneOptions<Activity>,
  ): Promise<Activity | undefined> {
    // this.acitivitiesRepository.createQueryBuilder('activities').select('activities').addSelect()
    return await this.acitivitiesRepository.findOne(options);
  }

  async save(artist: DeepPartial<Activity>): Promise<Activity> {
    return await this.acitivitiesRepository.save(artist);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.acitivitiesRepository.delete(id);
  }
}
