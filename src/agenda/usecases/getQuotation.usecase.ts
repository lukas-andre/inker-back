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
import { Artist } from '../../artists/infrastructure/entities/artist.entity';
import { ArtistDto } from '../../artists/domain/dtos/artist.dto';
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

  async execute(id: string, artistId?: string): Promise<GetQuotationResDto> {
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
    let offers: OpenQuotationOfferDto[] = [];
    let hasOffered = false; // Initialize hasOffered flag
    
    if (quotation.type === QuotationType.OPEN) {
      const quotationOffers = await this.quotationOfferRepo.findByQuotationIdsNative([id]);

      // Check if the artist has offered on this quotation
      if (artistId && quotationOffers.length > 0) {
        hasOffered = quotationOffers.some(offer => offer.artistId === artistId);
      }

      if (quotationOffers.length > 0) {
        // Get artist details for the offers
        const offerArtistIds = [...new Set(quotationOffers.map(o => o.artistId))];
        let artistsMap = new Map<string, any>();

        if (offerArtistIds.length > 0) {
          const offerArtists = await this.artistProvider.find({
            where: { id: In(offerArtistIds) },
            select: [
              'id', 
              'userId', 
              'username', 
              'firstName', 
              'lastName', 
              'profileThumbnail', 
              'shortDescription',
              'studioPhoto',
              'rating',
              'createdAt',
              'updatedAt'
            ],
            relations: ['contact']
          });
          artistsMap = new Map(offerArtists.map((a: Artist) => [a.id, a]));
        }

        offers = quotationOffers.map(offer => {
          const artistEntity = artistsMap.get(offer.artistId);
          let artistDto: ArtistDto | undefined = undefined;

          if (artistEntity) {
            artistDto = {
              id: artistEntity.id,
              userId: artistEntity.userId,
              username: artistEntity.username,
              firstName: artistEntity.firstName,
              lastName: artistEntity.lastName,
              profileThumbnail: artistEntity.profileThumbnail,
              shortDescription: artistEntity.shortDescription,
              studioPhoto: artistEntity.studioPhoto,
              contact: artistEntity.contact ? {
                id: artistEntity.contact.id,
                email: artistEntity.contact.email,
                phone: artistEntity.contact.phone,
                phoneCountryIsoCode: artistEntity.contact.phoneCountryIsoCode,
                phoneDialCode: artistEntity.contact.phoneDialCode,
                createdAt: artistEntity.contact.createdAt,
                updatedAt: artistEntity.contact.updatedAt,
              } : undefined,
              rating: artistEntity.rating,
              createdAt: artistEntity.createdAt,
              updatedAt: artistEntity.updatedAt,
            };
          }
          
          return {
            id: offer.id,
            artistName: artistEntity.username,
            quotationId: offer.quotationId,
            artistId: offer.artistId,
            estimatedCost: offer.estimatedCost,
            estimatedDuration: offer.estimatedDuration,
            message: offer.message,
            status: offer.status,
            createdAt: offer.createdAt,
            updatedAt: offer.updatedAt,
            messages: offer.messages ?? [],
            artist: artistDto,
          } as OpenQuotationOfferDto
        });
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
      hasOffered, // Add the hasOffered flag to the response
    };
  }
}
