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
import { CustomerProvider } from '../../customers/infrastructure/providers/customer.provider';
import { ArtistProvider } from '../../artists/infrastructure/database/artist.provider';
import { ArtistLocationProvider } from '../../locations/infrastructure/database/artistLocation.provider';

@Injectable()
export class GetQuotationsUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly quotationProvider: QuotationProvider,
    private readonly customerProvider: CustomerProvider,
    private readonly artistProvider: ArtistProvider,
    private readonly artistLocationProvider: ArtistLocationProvider,
  ) {
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
      order: { updatedAt: 'DESC' },
    });

    // Get unique IDs for customers and artists
    const customerIds = [...new Set(quotations.map(q => q.customerId))];
    const artistIds = [...new Set(quotations.map(q => q.artistId))];

    // Fetch all related data in parallel
    const [customers, artists, locations] = await Promise.all([
      this.customerProvider.find({ where: { id: In(customerIds) } }),
      this.artistProvider.find({ where: { id: In(artistIds) } }),
      this.artistLocationProvider.find({ where: { artistId: In(artistIds) } }),
    ]);

    // Create lookup maps for efficient access
    const customerMap = new Map(customers.map(c => [c.id, c]));
    const artistMap = new Map(artists.map(a => [a.id, a]));
    const locationMap = new Map(locations.map(l => [l.artistId, l]));

    // Map quotations to DTOs with related data
    const enrichedQuotations = quotations.map(quotation => ({
      ...quotation,
      customer: customerMap.get(quotation.customerId),
      artist: artistMap.get(quotation.artistId),
      location: locationMap.get(quotation.artistId),
    }));

    return {
      items: enrichedQuotations.map(quotation => this.mapToDto(quotation)),
      total,
    };
  }

  private mapToDto(quotation: any): QuotationDto {
    // Implement mapping logic here if needed
    return quotation as QuotationDto;
  }
}