import { Injectable } from '@nestjs/common';
import { StencilRepository } from '../../infrastructure/repositories/stencil.repository';
import { UpdateStencilDto, StencilDto } from '../../domain/dtos/stencil.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';

@Injectable()
export class UpdateStencilUseCase extends BaseUseCase {
  constructor(private readonly stencilProvider: StencilRepository) {
    super(UpdateStencilUseCase.name);
  }

  async execute(params: { id: string; artistId: string; dto: UpdateStencilDto }): Promise<StencilDto> {
    const { id, artistId, dto } = params;
    
    // Validation pipeline not working for multipart/form-data, so we need to convert the string to boolean
    // https://github.com/typestack/class-transformer/issues/550
    const isFeatured = dto.isFeatured === 'true' || dto.isFeatured === true;
    const isHidden = dto.isHidden === 'true' || dto.isHidden === true;
    
    const stencil = await this.stencilProvider.findStencilById(id);
    
    if (!stencil) {
      throw new Error('Stencil not found');
    }
    
    if (stencil.artistId !== artistId) {
      throw new Error('Stencil does not belong to this artist');
    }
    delete dto.isFeatured;
    delete dto.isHidden;
    return this.stencilProvider.updateStencil(id, dto, isFeatured, isHidden);
  }
}