import { Injectable } from '@nestjs/common';

import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { StencilRepository } from '../../infrastructure/repositories/stencil.repository';

@Injectable()
export class DeleteStencilUseCase extends BaseUseCase {
  constructor(private readonly stencilProvider: StencilRepository) {
    super(DeleteStencilUseCase.name);
  }

  async execute(params: { id: string; artistId: string }): Promise<void> {
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
