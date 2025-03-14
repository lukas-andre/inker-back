import { Injectable } from '@nestjs/common';
import { WorkProvider } from '../../infrastructure/database/work.provider';
import { UpdateWorkDto, WorkDto } from '../../domain/dtos/work.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';

@Injectable()
export class UpdateWorkUseCase extends BaseUseCase {
  constructor(private readonly workProvider: WorkProvider) {
    super(UpdateWorkUseCase.name);
  }

  async execute(params: { id: number; artistId: number; dto: UpdateWorkDto }): Promise<WorkDto> {
    const { id, artistId, dto } = params;
    
    const work = await this.workProvider.findWorkById(id);
    
    if (!work) {
      throw new Error('Work not found');
    }
    
    if (work.artistId !== artistId) {
      throw new Error('Work does not belong to this artist');
    }
    
    return this.workProvider.updateWork(id, dto);
  }
}