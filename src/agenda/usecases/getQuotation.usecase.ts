import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

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
import { QuotationOfferRepository } from '../infrastructure/repositories/quotationOffer.repository';
import { QuotationType } from '../infrastructure/entities/quotation.entity';
import { OpenQuotationOfferDto } from '../domain/dtos/openQuotationOffer.dto';

@Injectable()
export class GetQuotationUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly quotationProvider: QuotationRepository,
    private readonly customerProvider: CustomerRepository,
    private readonly artistProvider: ArtistRepository,
    private readonly artistLocationProvider: ArtistLocationRepository,
    private readonly stencilProvider: StencilRepository,
    private readonly tattooDesignCacheProvider: TattooDesignCacheRepository,
    private readonly quotationOfferRepo: QuotationOfferRepository,
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

    // Get customer data
    const customer = await this.customerProvider.findOne({ where: { id: quotation.customerId } });
    
    // Get artist and location data only if artistId exists
    let artist = null;
    let location = null;
    if (quotation.artistId) {
      [artist, location] = await Promise.all([
        this.artistProvider.findOne({ where: { id: quotation.artistId } }),
        this.artistLocationProvider.findOne({ where: { artistId: quotation.artistId } }),
      ]);
    }

    // Get offers for OPEN quotations
    let offers = [];
    if (quotation.type === QuotationType.OPEN) {
      const quotationOffers = await this.quotationOfferRepo.findByQuotationIdsNative([id]);
      
      if (quotationOffers.length > 0) {
        // Get artist names for the offers
        const offerArtistIds = [...new Set(quotationOffers.map(o => o.artistId))];
        let artistNameMap = new Map<string, string>();
        
        if (offerArtistIds.length > 0) {
          const offerArtists = await this.artistProvider.find({
            where: { id: In(offerArtistIds) },
            select: ['id', 'firstName', 'lastName'],
          });
          
          artistNameMap = new Map(offerArtists.map(a => [
            a.id, 
            `${a.firstName} ${a.lastName}`.trim() || 'Unknown Artist'
          ]));
        }
        
        offers = quotationOffers.map(offer => ({
          id: offer.id,
          artistId: offer.artistId,
          artistName: artistNameMap.get(offer.artistId) ?? 'Unknown Artist',
          estimatedCost: offer.estimatedCost,
          message: offer.message,
        } as OpenQuotationOfferDto));
      }
    }

    // Get stencil and tattoo design if they exist
    const [stencil, tattooDesignCache] = await Promise.all([
      quotation.stencilId ? this.stencilProvider.findStencilById(quotation.stencilId) : null,
      quotation.tattooDesignCacheId ? this.tattooDesignCacheProvider.findById(quotation.tattooDesignCacheId) : null
    ]);

    return {
      ...quotation,
      customer,
      artist,
      location,
      stencil,
      tattooDesignCache,
      offers,
    };
  }
}
