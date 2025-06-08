import { Injectable } from "@nestjs/common";
import { In } from "typeorm";
import { ArtistDto } from "../../../artists/domain/dtos/artist.dto";
import { Stencil } from "../../../artists/infrastructure/entities/stencil.entity";
import { ArtistRepository } from "../../../artists/infrastructure/repositories/artist.repository";
import { StencilRepository } from "../../../artists/infrastructure/repositories/stencil.repository";
import { CustomerDto } from "../../../customers/domain/dtos/customer.dto";
import { CustomerRepository } from "../../../customers/infrastructure/providers/customer.repository";
import { ArtistLocationRepository } from "../../../locations/infrastructure/database/artistLocation.repository";
import { ArtistLocation } from "../../../locations/infrastructure/database/entities/artistLocation.entity";
import { TattooDesignCacheEntity } from "../../../tattoo-generator/infrastructure/database/entities/tattooDesignCache.entity";
import { TattooDesignCacheRepository } from "../../../tattoo-generator/infrastructure/database/repositories/tattooDesignCache.repository";
import { GetQuotationResDto } from "../../infrastructure/dtos/getQuotationRes.dto";
import { Quotation } from "../../infrastructure/entities/quotation.entity";
import { QuotationOfferRepository } from "../../infrastructure/repositories/quotationOffer.repository";
import { OpenQuotationOfferDto } from "../dtos/openQuotationOffer.dto";

export interface QuotationEnrichmentOptions {
  includeOffers?: boolean;
  includeCustomer?: boolean;
  includeArtist?: boolean;
  includeStencil?: boolean;
  includeLocation?: boolean;
  includeTattooDesignCache?: boolean;
  includeHasOffered?: boolean;
  currentArtistId?: string;
}

@Injectable()
export class QuotationEnrichmentService {
  constructor(
    private readonly customerRepo: CustomerRepository,
    private readonly artistRepo: ArtistRepository,
    private readonly stencilRepo: StencilRepository,
    private readonly locationRepo: ArtistLocationRepository,
    private readonly offerRepo: QuotationOfferRepository,
    private readonly tattooDesignCacheRepo: TattooDesignCacheRepository,
  ) { }

  async enrichQuotations(
    quotations: Quotation[],
    options: QuotationEnrichmentOptions = {},
  ): Promise<GetQuotationResDto[]> {
    if (!quotations.length) return [];

    // 1. Extraer IDs únicos
    const customerIds = options.includeCustomer ? [...new Set(quotations.map(q => q.customerId).filter(Boolean))] : [];
    const artistIds = options.includeArtist ? [...new Set(quotations.map(q => q.artistId).filter(Boolean))] : [];
    const stencilIds = options.includeStencil ? [...new Set(quotations.map(q => q.stencilId).filter(Boolean))] : [];
    const tattooDesignCacheIds = options.includeTattooDesignCache ? [...new Set(quotations.map(q => q.tattooDesignCacheId).filter(Boolean))] : [];

    // 2. Fetch entidades relacionadas en paralelo
    const [customers, artists, stencils, tattooDesignCaches, locations, offers] = await Promise.all([
      options.includeCustomer && customerIds.length > 0 ? this.customerRepo.find({ where: { id: In(customerIds) } }) : [],
      options.includeArtist && artistIds.length > 0 ? this.artistRepo.find({ where: { id: In(artistIds) } }) : [],
      options.includeStencil && stencilIds.length > 0 ? Promise.all(stencilIds.map(id => this.stencilRepo.findStencilById(id))) : [],
      options.includeTattooDesignCache && tattooDesignCacheIds.length > 0 ? Promise.all(tattooDesignCacheIds.map(id => this.tattooDesignCacheRepo.findById(id))) : [],
      options.includeLocation && artistIds.length > 0 ? this.locationRepo.find({ where: { artistId: In(artistIds) } }) : [],
      options.includeOffers ? this.offerRepo.findByQuotationIdsNative(quotations.map(q => q.id)) : [],
    ]);

    // 3. Mapear entidades a mapas para acceso rápido
    const customerMap = new Map<string, CustomerDto>(customers.map((c: CustomerDto): [string, CustomerDto] => [c.id, c]));
    const artistMap = new Map<string, ArtistDto>(artists.map((a: ArtistDto): [string, ArtistDto] => [a.id, a]));
    const stencilMap = new Map<string, Stencil>(stencils.filter(Boolean).map((s: Stencil): [string, Stencil] => [s.id, s]));
    const tattooDesignCacheMap = new Map<string, TattooDesignCacheEntity>(tattooDesignCaches.filter(Boolean).map((tdc: TattooDesignCacheEntity): [string, TattooDesignCacheEntity] => [tdc.id, tdc]));
    const locationMap = new Map<string, ArtistLocation>(locations.map((l: ArtistLocation): [string, ArtistLocation] => [l.artistId, l]));

    // 4. Agrupar ofertas por quotationId
    let offersMap = new Map<string, OpenQuotationOfferDto[]>();
    if (options.includeOffers && offers.length > 0) {
      offers.forEach(offer => {
        const artist = artistMap.get(offer.artistId);
        const offerDto: OpenQuotationOfferDto = {
          id: offer.id,
          artistId: offer.artistId,
          artistName: artist ? `${artist.firstName} ${artist.lastName}`.trim() : 'Unknown Artist',
          estimatedCost: offer.estimatedCost,
          message: offer.message,
          messages: offer.messages ?? [],
          status: offer.status,
        };
        const existing = offersMap.get(offer.quotationId) || [];
        existing.push(offerDto);
        offersMap.set(offer.quotationId, existing);
      });
    }

    // Calcular hasOffered si corresponde
    let artistOfferMap = new Map<string, boolean>();
    if (options.includeHasOffered && options.currentArtistId && offers.length > 0) {
      for (const offer of offers) {
        if (offer.artistId === options.currentArtistId) {
          artistOfferMap.set(offer.quotationId, true);
        }
      }
    }

    // 5. Mapear cada quotation a GetQuotationResDto
    return quotations.map(q => {
      const dto: GetQuotationResDto = {
        ...q,
        customer: options.includeCustomer ? customerMap.get(q.customerId) : undefined,
        artist: options.includeArtist ? artistMap.get(q.artistId) : undefined,
        stencil: options.includeStencil && q.stencilId ? stencilMap.get(q.stencilId) : undefined,
        tattooDesignCache: options.includeTattooDesignCache && q.tattooDesignCacheId ? tattooDesignCacheMap.get(q.tattooDesignCacheId) : undefined,
        location: options.includeLocation && q.artistId ? locationMap.get(q.artistId) : undefined,
        offers: options.includeOffers ? offersMap.get(q.id) || [] : undefined,
        hasOffered: options.includeHasOffered && options.currentArtistId ? !!artistOfferMap.get(q.id) : undefined,
      };
      return dto;
    });
  }
} 