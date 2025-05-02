import { Injectable } from '@nestjs/common';

import { DomainNotFound } from '../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { QuotationRepository } from '../infrastructure/repositories/quotation.provider';
import { CustomerRepository } from '../../customers/infrastructure/providers/customer.repository';
import { ArtistRepository } from '../../artists/infrastructure/repositories/artist.repository';
import { ArtistLocationRepository } from '../../locations/infrastructure/database/artistLocation.repository';
import { StencilRepository } from '../../artists/infrastructure/repositories/stencil.repository';
import { GetQuotationResDto } from '../infrastructure/dtos/getQuotationRes.dto';
import { TattooDesignCacheRepository } from '../../tattoo-generator/infrastructure/database/repositories/tattooDesignCache.repository';

@Injectable()
export class GetQuotationUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly quotationProvider: QuotationRepository,
    private readonly customerProvider: CustomerRepository,
    private readonly artistProvider: ArtistRepository,
    private readonly artistLocationProvider: ArtistLocationRepository,
    private readonly stencilProvider: StencilRepository,
    private readonly tattooDesignCacheProvider: TattooDesignCacheRepository,
  ) {
    super(GetQuotationUseCase.name);
  }

  async execute(id: string): Promise<GetQuotationResDto> {
    const quotation = await this.quotationProvider.findOne({
      where: { id },
      relations: ['history'],
    });

    if (!quotation) {
      throw new DomainNotFound('Quotation not found');
    }

    const [customer, artist, location, stencil, tattooDesignCache] = await Promise.all([
      this.customerProvider.findOne({ where: { id: quotation.customerId } }),
      this.artistProvider.findOne({ where: { id: quotation.artistId } }),
      this.artistLocationProvider.findOne({
        where: { artistId: quotation.artistId },
      }),
      quotation.stencilId ? this.stencilProvider.findStencilById(quotation.stencilId) : null,
      quotation.tattooDesignCacheId ? this.tattooDesignCacheProvider.findById(quotation.tattooDesignCacheId) : null
    ]);

    return {
      ...quotation,
      customer,
      artist,
      location,
      stencil,
      tattooDesignCache: tattooDesignCache
    };
  }
}
