import { Injectable } from '@nestjs/common';
import { InteractionRepository } from '../infrastructure/database/repositories/interaction.repository';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';

@Injectable()
export class GetTrendingContentUseCase extends BaseUseCase {
  constructor(private readonly interactionProvider: InteractionRepository) {
    super(GetTrendingContentUseCase.name);
  }

  async execute(params: {
    entityType: string;
    limit?: number;
    daysBack?: number;
  }): Promise<{ entityId: string; count: number }[]> {
    const { entityType, limit = 10, daysBack = 30 } = params;

    // Combine both likes and views, but weight likes more heavily
    const likedEntities = await this.interactionProvider.getRecentPopularEntities(
      entityType,
      'like',
      limit * 2,
      daysBack,
    );

    const viewedEntities = await this.interactionProvider.getRecentPopularEntities(
      entityType,
      'view',
      limit * 2,
      daysBack,
    );

    // Create a map to combine likes and views
    const entityScores = new Map<string, number>();

    // Likes count 5x more than views
    likedEntities.forEach(entity => {
      entityScores.set(entity.entityId, (entityScores.get(entity.entityId) || 0) + entity.count * 5);
    });

    viewedEntities.forEach(entity => {
      entityScores.set(entity.entityId, (entityScores.get(entity.entityId) || 0) + entity.count);
    });

    // Convert to array and sort by score
    const result = Array.from(entityScores.entries())
      .map(([entityId, count]) => ({ entityId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return result;
  }
}