import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, In } from 'typeorm';

import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { UserType } from '../../users/domain/enums/userType.enum';
import { QuotationDto } from '../infrastructure/dtos/getQuotationRes.dto';
import { GetQuotationsQueryDto } from '../infrastructure/dtos/getQuotationsQuery.dto';
import { Quotation } from '../infrastructure/entities/quotation.entity';
import { QuotationProvider } from '../infrastructure/providers/quotation.provider';

@Injectable()
export class GetQuotationsUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly quotationProvider: QuotationProvider) {
    super(GetQuotationsUseCase.name);
  }

  // TODO: Add cache on this method
  async execute(
    query: GetQuotationsQueryDto,
    userType: UserType,
    userTypeId: number,
  ): Promise<{ items: QuotationDto[]; total: number }> {
    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Quotation> = {};

    if (userType === UserType.ARTIST) {
      where.artistId = userTypeId;
    } else if (userType === UserType.CUSTOMER) {
      where.customerId = userTypeId;
    }

    if (status) {
      where.status = In([...status.split(',')]);
    }

    const [quotations, total] = await this.quotationProvider.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['history'],
      order: { createdAt: 'DESC' },
    });

    return {
      items: quotations.map(quotation => this.mapToDto(quotation)),
      total,
    };
  }

  private mapToDto(quotation: any): QuotationDto {
    // Implement mapping logic here
    return quotation as QuotationDto;
  }
}
