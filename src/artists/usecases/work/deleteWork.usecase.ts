import { Injectable } from '@nestjs/common';

import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';
import { WorkRepository } from '../../infrastructure/repositories/work.repository';

@Injectable()
export class DeleteWorkUseCase extends BaseUseCase {
  constructor(private readonly workProvider: WorkRepository) {
    super(DeleteWorkUseCase.name);
  }

  async execute(params: { id: string; artistId: string }): Promise<void> {
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
