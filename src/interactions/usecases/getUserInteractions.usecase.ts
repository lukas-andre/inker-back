import { Injectable } from '@nestjs/common';
import { InteractionProvider } from '../infrastructure/database/interaction.provider';
import { InteractionDto } from '../domain/dtos/interaction.dto';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';

@Injectable()
export class GetUserInteractionsUseCase extends BaseUseCase {
  constructor(private readonly interactionProvider: InteractionProvider) {
    super(GetUserInteractionsUseCase.name);
  }

  async execute(params: {
    userId: number;
    entityType: string;
    entityId: number;
    interactionType?: string;
  }): Promise<InteractionDto[]> {
    const { userId, entityType, entityId, interactionType } = params;
    
    return this.interactionProvider.findByUserAndEntity(
      userId,
      entityType,
      entityId,
      interactionType,
    );
  }
}