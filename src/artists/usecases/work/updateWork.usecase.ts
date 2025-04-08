import { Injectable } from '@nestjs/common';
import { WorkRepository } from '../../infrastructure/repositories/work.repository';
import { UpdateWorkDto, WorkDto } from '../../domain/dtos/work.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';

@Injectable()
export class UpdateWorkUseCase extends BaseUseCase {
  constructor(private readonly workProvider: WorkRepository) {
    super(UpdateWorkUseCase.name);
  }

  async execute(params: { id: string; artistId: string; dto: UpdateWorkDto }): Promise<WorkDto> {
    const { id, artistId, dto } = params;
    
    // Validation pipeline not working for multipart/form-data, so we need to convert the string to boolean
    // https://github.com/typestack/class-transformer/issues/550
    const isFeatured = dto.isFeatured === 'true' || dto.isFeatured === true;
    const isHidden = dto.isHidden === 'true' || dto.isHidden === true;
    
    const work = await this.workProvider.findWorkById(id);
    
    if (!work) {
      throw new Error('Work not found');
    }
    
    if (work.artistId !== artistId) {
      throw new Error('Work does not belong to this artist');
    }
    delete dto.isFeatured;
    delete dto.isHidden;
    return this.workProvider.updateWork(id, dto, isFeatured, isHidden);
  }
}