import { Injectable } from '@nestjs/common';
import { InteractionProvider } from '../infrastructure/database/interaction.provider';
import { BaseUseCase } from '../../global/domain/usecases/base.usecase';

@Injectable()
export class DeleteInteractionUseCase extends BaseUseCase {
  constructor(private readonly interactionProvider: InteractionProvider) {
    super(DeleteInteractionUseCase.name);
  }


  async execute(params: { userId: number; interactionId: number }): Promise<void> {
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