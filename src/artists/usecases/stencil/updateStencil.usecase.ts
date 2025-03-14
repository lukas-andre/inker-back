import { Injectable } from '@nestjs/common';
import { StencilProvider } from '../../infrastructure/database/stencil.provider';
import { UpdateStencilDto, StencilDto } from '../../domain/dtos/stencil.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';

@Injectable()
export class UpdateStencilUseCase extends BaseUseCase {
  constructor(private readonly stencilProvider: StencilProvider) {
    super(UpdateStencilUseCase.name);
  }

  async execute(params: { id: number; artistId: number; dto: UpdateStencilDto }): Promise<StencilDto> {
    const { id, artistId, dto } = params;
    
    const stencil = await this.stencilProvider.findStencilById(id);
    
    if (!stencil) {
      throw new Error('Stencil not found');
    }
    
    if (stencil.artistId !== artistId) {
      throw new Error('Stencil does not belong to this artist');
    }
    
    return this.stencilProvider.updateStencil(id, dto);
  }
}