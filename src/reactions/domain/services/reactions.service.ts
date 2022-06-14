import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceError } from '../../../global/domain/interfaces/serviceError';
import { BaseService } from '../../../global/domain/services/base.service';
import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Reaction } from '../../../reactions/infrastructure/entities/reaction.entity';
import { GroupedReactionsInterface } from '../interfaces/groupedReactions.interface';

@Injectable()
export class ReactionsService extends BaseService {
  constructor(
    @InjectRepository(Reaction, 'reaction-db')
    private readonly reactionsRepository: Repository<Reaction>,
  ) {
    super(ReactionsService.name);
  }

  async findById(id: number) {
    return this.reactionsRepository.findOne({ where: { id } });
  }

  async find(options: FindManyOptions<Reaction>) {
    return this.reactionsRepository.find(options);
  }

  async findByKey(
    findConditions: FindOptionsWhere<Reaction>,
    // TODO: LOOK THIS SELECT :O
    select: (keyof Reaction)[],
  ) {
    return this.reactionsRepository.find({
      select,
      where: {
        ...findConditions,
      },
    });
  }

  async findAndCount(options: FindManyOptions<Reaction>) {
    return this.reactionsRepository.findAndCount(options);
  }

  async findOne(
    options?: FindOneOptions<Reaction>,
  ): Promise<Reaction | undefined> {
    return this.reactionsRepository.findOne(options);
  }

  async save(reaction: DeepPartial<Reaction>): Promise<Reaction> {
    return this.reactionsRepository.save(reaction);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.reactionsRepository.delete(id);
  }

  async findByActivityIdAndActivityType(
    activityId: number,
    activity: string,
  ): Promise<GroupedReactionsInterface[] | ServiceError> {
    try {
      return await this.reactionsRepository
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
        .getRawMany();
    } catch (error) {
      return this.serviceError(
        this.findByActivityIdAndActivityType,
        'Problems listing reactions',
        error.message,
      );
    }
  }
}
