import { Injectable } from '@nestjs/common';
import { InteractionRepository } from '../infrastructure/database/repositories/interaction.repository';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';

@Injectable()
export class DeleteInteractionUseCase extends BaseUseCase {
  constructor(private readonly interactionProvider: InteractionRepository) {
    super(DeleteInteractionUseCase.name);
  }


  async execute(params: { userId: string; interactionId: string }): Promise<void> {
    const { userId, interactionId } = params;
    
    const interactions = await this.interactionProvider.findByUserAndEntity(
      userId,
      null,
      null,
    );
    
    const targetInteraction = interactions.find(i => i.id === interactionId);
    
    if (!targetInteraction) {
      throw new Error('Interaction not found or does not belong to this user');
    }
    
    await this.interactionProvider.delete(interactionId);
  }
}