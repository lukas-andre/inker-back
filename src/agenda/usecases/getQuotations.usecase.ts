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

@Injectable()
export class GetQuotationsUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly quotationProvider: QuotationRepository,
    private readonly customerProvider: CustomerRepository,
    private readonly artistProvider: ArtistRepository,
    private readonly artistLocationProvider: ArtistLocationRepository,
    private readonly stencilProvider: StencilRepository,
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
    const artistIds = [...new Set(quotations.map(q => q.artistId))];
    const stencilIds = quotations.filter(q => q.stencilId).map(q => q.stencilId);

    // Fetch all related data in parallel
    const [customers, artists, locations, stencils] = await Promise.all([
      this.customerProvider.find({ where: { id: In(customerIds) } }),
      this.artistProvider.find({ where: { id: In(artistIds) } }),
      this.artistLocationProvider.find({ where: { artistId: In(artistIds) } }),
      stencilIds.length > 0 
        ? Promise.all(stencilIds.map(id => this.stencilProvider.findStencilById(id)))
        : [],
    ]);

    // Create lookup maps for efficient access
    const customerMap = new Map(customers.map(c => [c.id, c]));
    const artistMap = new Map(artists.map(a => [a.id, a]));
    const locationMap = new Map(locations.map(l => [l.artistId, l]));
    const stencilMap = new Map(stencils.filter(Boolean).map(s => [s.id, s]));

    // Map quotations to DTOs with related data
    const enrichedQuotations = quotations.map(quotation => ({
      ...quotation,
      customer: customerMap.get(quotation.customerId),
      artist: artistMap.get(quotation.artistId),
      location: locationMap.get(quotation.artistId),
      stencil: quotation.stencilId ? stencilMap.get(quotation.stencilId) : null,
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
