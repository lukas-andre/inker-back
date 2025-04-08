import { Injectable } from '@nestjs/common';
import { InteractionRepository } from '../infrastructure/database/repositories/interaction.repository';
import { InteractionDto } from '../domain/dtos/interaction.dto';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';

@Injectable()
export class GetUserInteractionsUseCase extends BaseUseCase {
  constructor(private readonly interactionProvider: InteractionRepository) {
    super(GetUserInteractionsUseCase.name);
  }

  async execute(params: {
    userId: string;
    entityType: string;
    entityId: string;
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