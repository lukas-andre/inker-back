import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, In } from 'typeorm';

import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { UserType } from '../../users/domain/enums/userType.enum';
import { GetQuotationsQueryDto } from '../infrastructure/dtos/getQuotationsQuery.dto';
import { Quotation } from '../infrastructure/entities/quotation.entity';
import { QuotationRepository } from '../infrastructure/repositories/quotation.provider';
import { CustomerRepository } from '../../customers/infrastructure/providers/customer.repository';
import { ArtistRepository } from '../../artists/infrastructure/repositories/artist.repository';
import { ArtistLocationRepository } from '../../locations/infrastructure/database/artistLocation.repository';
import { StencilRepository } from '../../artists/infrastructure/repositories/stencil.repository';
import { GetQuotationResDto } from '../infrastructure/dtos/getQuotationRes.dto';
import { TattooDesignCacheRepository } from '../../tattoo-generator/infrastructure/database/repositories/tattooDesignCache.repository';
import { TattooDesignCacheEntity } from '../../tattoo-generator/infrastructure/database/entities/tattooDesignCache.entity';
import { Artist } from '../../artists/infrastructure/entities/artist.entity';
import { Stencil } from '../../artists/infrastructure/entities/stencil.entity';
import { Customer } from '../../customers/infrastructure/entities/customer.entity';
import { ArtistLocation } from '../../locations/infrastructure/database/entities/artistLocation.entity';

@Injectable()
export class GetQuotationsUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly quotationProvider: QuotationRepository,
    private readonly customerProvider: CustomerRepository,
    private readonly artistProvider: ArtistRepository,
    private readonly artistLocationProvider: ArtistLocationRepository,
    private readonly stencilProvider: StencilRepository,
    private readonly tattooDesignCacheProvider: TattooDesignCacheRepository,
  ) {
    super(GetQuotationsUseCase.name);
  }

  // TODO: Add cache on this method
  async execute(
    query: GetQuotationsQueryDto,
    userType: UserType,
    userTypeId: string,
  ): Promise<{ items: GetQuotationResDto[]; total: number }> {
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
      order: { updatedAt: 'DESC' },
    });

    // Get unique IDs for customers, artists, and stencils
    const customerIds = [...new Set(quotations.map(q => q.customerId))];
    const artistIds = [...new Set(quotations.map(q => q.artistId).filter(Boolean))];
    const stencilIds = quotations.filter(q => q.stencilId).map(q => q.stencilId);
    const tattooDesignCacheIds = quotations.filter(q => q.tattooDesignCacheId).map(q => q.tattooDesignCacheId);

    // Fetch all related data in parallel
    const [customers, artists, locations, stencils, tattooDesignCaches]: [
      Customer[],
      Artist[],
      ArtistLocation[],
      (Stencil | null)[],
      (TattooDesignCacheEntity | null)[]
    ] = await Promise.all([
      customerIds.length > 0 ? this.customerProvider.find({ where: { id: In(customerIds) } }) : [],
      artistIds.length > 0 ? this.artistProvider.find({ where: { id: In(artistIds) } }) : [],
      artistIds.length > 0 ? this.artistLocationProvider.find({ where: { artistId: In(artistIds) } }) : [],
      stencilIds.length > 0 
        ? Promise.all(stencilIds.map(id => this.stencilProvider.findStencilById(id)))
        : [],
      tattooDesignCacheIds.length > 0
        ? Promise.all(tattooDesignCacheIds.map(id => this.tattooDesignCacheProvider.findById(id)))
        : [],
    ]);

    // Create lookup maps for efficient access
    const customerMap = new Map<string, Customer>(customers.map(c => [c.id, c]));
    const artistMap = new Map<string, Artist>(artists.map(a => [a.id, a]));
    const locationMap = new Map<string, ArtistLocation>(locations.map(l => [l.artistId, l]));
    const stencilMap = new Map<string, Stencil>(stencils.filter((s): s is Stencil => s !== null).map(s => [s.id, s]));
    const tattooDesignCacheMap = new Map<string, TattooDesignCacheEntity>(tattooDesignCaches.filter((tdc): tdc is TattooDesignCacheEntity => tdc !== null).map(tdc => [tdc.id, tdc]));

    // Map quotations to DTOs with related data
    const enrichedQuotations = quotations.map(quotation => ({
      ...quotation,
      customer: customerMap.get(quotation.customerId),
      artist: artistMap.get(quotation.artistId),
      location: locationMap.get(quotation.artistId),
      stencil: quotation.stencilId ? stencilMap.get(quotation.stencilId) : null,
      tattooDesignCache: quotation.tattooDesignCacheId ? tattooDesignCacheMap.get(quotation.tattooDesignCacheId) : null,
    }));

    return {
      items: enrichedQuotations.map(quotation => this.mapToDto(quotation)),
      total,
    };
  }

  private mapToDto(quotation: any): GetQuotationResDto {
    // Implement mapping logic here if needed
    return quotation as GetQuotationResDto;
  }
}
