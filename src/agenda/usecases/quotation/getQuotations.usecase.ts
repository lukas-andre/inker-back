import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, In } from 'typeorm';

import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { GetQuotationsQueryDto } from '../../infrastructure/dtos/getQuotationsQuery.dto';
import { Quotation } from '../../infrastructure/entities/quotation.entity';
import { QuotationRepository } from '../../infrastructure/repositories/quotation.provider';

import { GetQuotationResDto } from '../../infrastructure/dtos/getQuotationRes.dto';

import { OpenQuotationOfferDto } from '../../domain/dtos/openQuotationOffer.dto';
import { QuotationEnrichmentService } from '../../domain/services/quotationEnrichment.service';

@Injectable()
export class GetQuotationsUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly quotationProvider: QuotationRepository,
    private readonly quotationEnrichmentService: QuotationEnrichmentService,
  ) {
    super(GetQuotationsUseCase.name);
  }

  async execute(
    query: GetQuotationsQueryDto,
    userType: UserType,
    userTypeId: string,
  ): Promise<{ items: GetQuotationResDto[]; total: number }> {
    const { status, type, page = 1, limit = 10 } = query;
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

    if (type) {
      where.type = type;
    }

    const [quotations, total] = await this.quotationProvider.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['history'],
      order: { updatedAt: 'DESC' },
    });

    const enrichedQuotations = await this.quotationEnrichmentService.enrichQuotations(quotations, {
      includeOffers: true,
      includeCustomer: true,
      includeArtist: true,
      includeStencil: true,
      includeLocation: true,
      includeTattooDesignCache: true,
    });

    return {
      items: enrichedQuotations,
      total,
    };
  }
}
