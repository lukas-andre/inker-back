import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseComponent } from '../../../../global/domain/components/base.component';
import { CreateInteractionDto } from '../../../domain/dtos/interaction.dto';
import { Interaction } from '../entities/interaction.entity';

@Injectable()
export class InteractionRepository extends BaseComponent {
  constructor(
    @InjectRepository(Interaction, 'artist-db')
    private readonly interactionRepository: Repository<Interaction>,
  ) {
    super(InteractionRepository.name);
  }

  async findByUserAndEntity(
    userId: string,
    entityType: string,
    entityId: string,
    interactionType?: string,
  ): Promise<Interaction[]> {
    const query = {
      userId,
      entityType,
      entityId,
    };

    if (interactionType) {
      query['interactionType'] = interactionType;
    }

    return this.interactionRepository.find({
      where: query,
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    userId: string,
    createInteractionDto: CreateInteractionDto,
  ): Promise<Interaction> {
    const interaction = this.interactionRepository.create({
      userId,
      ...createInteractionDto,
    });

    return this.interactionRepository.save(interaction);
  }

  async delete(id: string): Promise<void> {
    await this.interactionRepository.delete(id);
  }

  async countInteractionsByEntity(
    entityType: string,
    entityId: string,
    interactionType?: string,
  ): Promise<number> {
    const query = {
      entityType,
      entityId,
    };

    if (interactionType) {
      query['interactionType'] = interactionType;
    }

    return this.interactionRepository.count({
      where: query,
    });
  }

  async getRecentPopularEntities(
    entityType: string,
    interactionType: string,
    limit = 10,
    daysBack = 30,
  ): Promise<{ entityId: string; count: number }[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);

    const result = await this.interactionRepository
      .createQueryBuilder('interaction')
      .select('interaction.entityId', 'entityId')
      .addSelect('COUNT(interaction.id)', 'count')
      .where('interaction.entityType = :entityType', { entityType })
      .andWhere('interaction.interactionType = :interactionType', {
        interactionType,
      })
      .andWhere('interaction.createdAt > :dateThreshold', { dateThreshold })
      .groupBy('interaction.entityId')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(item => ({
      entityId: item.entityId,
      count: Number(item.count),
    }));
  }
}
