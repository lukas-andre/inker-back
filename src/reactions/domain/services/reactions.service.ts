import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reaction } from '../../../reactions/infrastructure/entities/reaction.entity';
import {
  Repository,
  FindManyOptions,
  FindConditions,
  FindOneOptions,
  DeepPartial,
  DeleteResult,
} from 'typeorm';
import { GroupedReactionsInterface } from '../interfaces/groupedReaections.interface';

@Injectable()
export class ReactionsService {
  private readonly serviceName: string = ReactionsService.name;

  constructor(
    @InjectRepository(Reaction, 'reaction-db')
    private readonly reactionsRepository: Repository<Reaction>,
  ) {}

  async findById(id: string) {
    return await this.reactionsRepository.findOne(id);
  }

  async find(options: FindManyOptions<Reaction>) {
    return await this.reactionsRepository.find(options);
  }

  async findByKey(
    findConditions: FindConditions<Reaction>,
    select: (keyof Reaction)[],
  ) {
    return await this.reactionsRepository.find({
      select,
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<Reaction>) {
    return await this.reactionsRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<Reaction>,
  ): Promise<Reaction | undefined> {
    return await this.reactionsRepository.findOne(options);
  }

  async save(reaction: DeepPartial<Reaction>): Promise<Reaction> {
    return await this.reactionsRepository.save(reaction);
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.reactionsRepository.delete(id);
  }

  async findByActivityIdAndActivityType(
    activityId: number,
    activity: string,
  ): Promise<any> {
    return (await this.reactionsRepository
      .createQueryBuilder('reactions')
      .select(
        `json_agg(json_build_object('reaction_type', reactions.reaction_type, 'user_id', reactions.user_id, 'user_type_id', reactions.user_type_id, 'user_type', reactions.user_type, 'profile_thumbnail', reactions.profile_thumbnail, 'username', reactions.username)) AS reactions`,
      )
      .addSelect('COUNT(reactions.reaction_type) AS group_total')
      .addSelect('reactions.reaction_type AS reaction_type')
      .where('reactions.active = true')
      .andWhere('reactions.activity_id = :activityId', { activityId })
      .andWhere('reactions.activity_type = :activity', { activity })
      .groupBy('reactions.reaction_type')
      .getRawMany()) as GroupedReactionsInterface[];
  }
}
