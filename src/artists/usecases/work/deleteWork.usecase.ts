import { Injectable } from '@nestjs/common';
import { WorkProvider } from '../../infrastructure/database/work.provider';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';

@Injectable()
export class DeleteWorkUseCase extends BaseUseCase {
  constructor(private readonly workProvider: WorkProvider) {
    super(DeleteWorkUseCase.name);
  }

  async execute(params: { id: number; artistId: number }): Promise<void> {
    const { id, artistId } = params;
    
    const work = await this.workProvider.findWorkById(id);
    
    if (!work) {
      throw new Error('Work not found');
    }
    
    if (work.artistId !== artistId) {
      throw new Error('Work does not belong to this artist');
    }
    
    await this.workProvider.deleteWork(id);
  }
}