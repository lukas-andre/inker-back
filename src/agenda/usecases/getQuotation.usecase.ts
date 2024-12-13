import { Injectable } from '@nestjs/common';

import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { QuotationDto } from '../infrastructure/dtos/getQuotationRes.dto';
import { QuotationProvider } from '../infrastructure/providers/quotation.provider';
import { CustomerProvider } from '../../customers/infrastructure/providers/customer.provider';
import { ArtistProvider } from '../../artists/infrastructure/database/artist.provider';
import { ArtistLocationProvider } from '../../locations/infrastructure/database/artistLocation.provider';

@Injectable()
export class GetQuotationUseCase extends BaseUseCase implements UseCase {
  constructor(private readonly quotationProvider: QuotationProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly artistLocationProvider: ArtistLocationProvider,

  ) {
    super(GetQuotationUseCase.name);
  }

  async execute(id: number): Promise<Partial<QuotationDto>> {
    const quotation = await this.quotationProvider.findOne({
      where: { id },
      relations: ['history'],
    });

    if (!quotation) {
      throw new DomainNotFound('Quotation not found');
    }

    const [customer, artist, location] = await Promise.all([
      this.customerProvider.findOne({ where: { id: quotation.customerId } }),
      this.artistProvider.findOne({ where: { id: quotation.artistId } }),
      this.artistLocationProvider.findOne({ where: { artistId: quotation.artistId } }),
    ]);


    return {
      ...quotation,
      customer,
      artist,
      location
    };
  }
}
