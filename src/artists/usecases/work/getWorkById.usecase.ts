import { Injectable } from '@nestjs/common';
import { WorkProvider } from '../../infrastructure/database/work.provider';
import { WorkDto } from '../../domain/dtos/work.dto';
import { BaseUseCase } from '../../../global/domain/usecases/base.usecase';

@Injectable()
export class GetWorkByIdUseCase extends BaseUseCase {
  constructor(private readonly workProvider: WorkProvider) {
    super(GetWorkByIdUseCase.name);
  }

  async execute(params: { id: number }): Promise<WorkDto | null> {
    const { id } = params;
    return this.workProvider.findWorkById(id);
  }
}