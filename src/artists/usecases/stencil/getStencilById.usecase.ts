import { Injectable } from '@nestjs/common';
import { StencilProvider } from '../../infrastructure/database/stencil.provider';
import { StencilDto } from '../../domain/dtos/stencil.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';

@Injectable()
export class GetStencilByIdUseCase extends BaseUseCase {
  constructor(private readonly stencilProvider: StencilProvider) {
    super(GetStencilByIdUseCase.name);
  }

  async execute(params: { id: number }): Promise<StencilDto | null> {
    const { id } = params;
    return this.stencilProvider.findStencilById(id);
  }
}