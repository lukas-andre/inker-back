import { Injectable } from '@nestjs/common';
import { CreateInteractionUseCase } from '../usecases/createInteraction.usecase';
import { GetUserInteractionsUseCase } from '../usecases/getUserInteractions.usecase';
import { DeleteInteractionUseCase } from '../usecases/deleteInteraction.usecase';
import { GetTrendingContentUseCase } from '../usecases/getTrendingContent.usecase';
import { CreateInteractionDto, InteractionDto } from '../domain/dtos/interaction.dto';
import { BaseComponent } from '../../global/domain/components/base.component';

@Injectable()
export class InteractionsHandler extends BaseComponent {
  constructor(
    private readonly createInteractionUseCase: CreateInteractionUseCase,
    private readonly getUserInteractionsUseCase: GetUserInteractionsUseCase,
    private readonly deleteInteractionUseCase: DeleteInteractionUseCase,
    private readonly getTrendingContentUseCase: GetTrendingContentUseCase,
  ) {
    super(InteractionsHandler.name);
  }

  async createInteraction(userId: string, dto: CreateInteractionDto): Promise<InteractionDto> {
    this.logger.log(`Creating interaction for user: ${userId}, type: ${dto.interactionType}`);
    return this.createInteractionUseCase.execute({ userId, dto });
  }

  async getUserInteractions(
    userId: string,
    entityType: string,
    entityId: string,
    interactionType?: string,
  ): Promise<InteractionDto[]> {
    this.logger.log(`Getting interactions for user: ${userId}, entity: ${entityType}/${entityId}`);
    return this.getUserInteractionsUseCase.execute({
      userId,
      entityType,
      entityId,
      interactionType,
    });
  }

  async deleteInteraction(userId: string, interactionId: string): Promise<void> {
    this.logger.log(`Deleting interaction: ${interactionId} for user: ${userId}`);
    return this.deleteInteractionUseCase.execute({ userId, interactionId });
  }

  async getTrendingContent(
    entityType: string,
    limit?: number,
    daysBack?: number,
  ): Promise<{ entityId: string; count: number }[]> {
    this.logger.log(`Getting trending ${entityType} content`);
    return this.getTrendingContentUseCase.execute({ entityType, limit, daysBack });
  }
}