import { Injectable } from '@nestjs/common';
import { InteractionProvider } from '../infrastructure/database/interaction.provider';
import { CreateInteractionDto, InteractionDto } from '../domain/dtos/interaction.dto';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';
import { RecordAnalyticsUseCase } from './recordAnalytics.usecase';

@Injectable()
export class CreateInteractionUseCase extends BaseUseCase {
  constructor(
    private readonly interactionProvider: InteractionProvider,
    private readonly recordAnalyticsUseCase: RecordAnalyticsUseCase,
  ) {
    super(CreateInteractionUseCase.name);
  }

  async execute(params: { userId: number; dto: CreateInteractionDto }): Promise<InteractionDto> {
    const { userId, dto } = params;
    
    // For 'like' interactions, we should ensure only one like per user per entity
    if (dto.interactionType === 'like') {
      const existingLikes = await this.interactionProvider.findByUserAndEntity(
        userId,
        dto.entityType,
        dto.entityId,
        'like',
      );
      
      if (existingLikes.length > 0) {
        return existingLikes[0];
      }
    }
    
    // Create the interaction
    const interaction = await this.interactionProvider.create(userId, dto);
    
    // Record analytics in the background (non-blocking)
    this.recordAnalyticsUseCase.execute({ userId, dto })
      .catch(error => this.logger.error(`Failed to record analytics: ${error.message}`, error.stack));
    
    return interaction;
  }
}