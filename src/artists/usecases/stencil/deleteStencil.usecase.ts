import { Injectable } from '@nestjs/common';
import { StencilProvider } from '../../infrastructure/database/stencil.provider';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';

@Injectable()
export class DeleteStencilUseCase extends BaseUseCase {
  constructor(private readonly stencilProvider: StencilProvider) {
    super(DeleteStencilUseCase.name);
  }

  async execute(params: { id: number; artistId: number }): Promise<void> {
    const { id, artistId } = params;
    
    const stencil = await this.stencilProvider.findStencilById(id);
    
    if (!stencil) {
      throw new Error('Stencil not found');
    }
    
    if (stencil.artistId !== artistId) {
      throw new Error('Stencil does not belong to this artist');
    }
    
    await this.stencilProvider.deleteStencil(id);
  }
}