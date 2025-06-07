import { Injectable, UnauthorizedException } from '@nestjs/common';

import { DomainNotFound } from '../../../global/domain/exceptions/domain.exception';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { ArtistLocationRepository } from '../../../locations/infrastructure/database/artistLocation.repository';
import { ArtistLocation } from '../../../locations/infrastructure/database/entities/artistLocation.entity';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { ArtistRepository } from '../../../artists/infrastructure/repositories/artist.repository';
import { QuotationRepository } from '../../infrastructure/repositories/quotation.provider';
import { QuotationEnrichmentService } from '../../domain/services/quotationEnrichment.service';
import { GetQuotationResDto } from '../../infrastructure/dtos/getQuotationRes.dto';
import { EventActionEngineService } from '../../domain/services/eventActionEngine.service';
import { Quotation } from '../../infrastructure/entities/quotation.entity';
import { QuotationOffer } from '../../infrastructure/entities/quotationOffer.entity';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { Artist } from '../../../artists/infrastructure/entities/artist.entity';
import { EventActionsResultDto } from '../../domain/dtos';

@Injectable()
export class FindEventFromArtistByEventIdUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(
    private readonly agendaProvider: AgendaRepository,
    private readonly agendaEventProvider: AgendaEventRepository,
    private readonly artistLocationProvider: ArtistLocationRepository,
    private readonly artistProvider: ArtistRepository,
    private readonly quotationRepository: QuotationRepository,
    private readonly quotationEnrichmentService: QuotationEnrichmentService,
    private readonly eventActionEngine: EventActionEngineService,
  ) {
    super(FindEventFromArtistByEventIdUseCase.name);
  }

  async execute(
    artistId: string,
    eventId: string,
  ): Promise<{
    event: AgendaEvent;
    location: ArtistLocation;
    artist: Artist;
    quotation: GetQuotationResDto | null;
    actions: EventActionsResultDto;
  }> {
    const existsAgenda = await this.agendaProvider.findOne({
      where: {
        artistId,
      },
    });

    if (!existsAgenda) {
      throw new DomainNotFound('Agenda not found');
    }

    const [event, location, artist] = await Promise.all([
      this.agendaEventProvider.findOne({
        where: { id: eventId, agenda: { id: existsAgenda.id } },
        relations: ['agenda'],
      }),
      this.artistLocationProvider.findByArtistId(artistId),
      this.artistProvider.findOne({
        where: { id: artistId },
        relations: ['contact']
      }),
    ]);

    if (!event) {
      throw new DomainNotFound('Event not found');
    }

    if (!location) {
      this.logger.warn('Location not found');
    }

    let enrichedQuotation: GetQuotationResDto | null = null;
    let quotationEntity: Quotation | undefined;
    let offerEntity: QuotationOffer | undefined;
    if (event.quotationId) {
      quotationEntity = await this.quotationRepository.findById(event.quotationId);
      if (quotationEntity) {
        const [enriched] = await this.quotationEnrichmentService.enrichQuotations([
          quotationEntity
        ], {
          includeOffers: true,
          includeCustomer: true,
          includeArtist: true,
          includeStencil: true,
          includeLocation: true,
          includeTattooDesignCache: true,
        });
        enrichedQuotation = enriched || null;
        offerEntity = quotationEntity.offers?.[0];
      }
    }

    const actions = await this.eventActionEngine.getAvailableActions({
      userId: artistId,
      userType: UserType.ARTIST,
      event,
      quotation: quotationEntity,
      offer: offerEntity,
    });

    return {
      event,
      artist,
      location: location[0],
      quotation: enrichedQuotation,
      actions,
    };
  }

  async executeForCustomer(
    customerId: string,
    eventId: string,
  ): Promise<{
    event: AgendaEvent;
    artist: Artist;
    location: ArtistLocation;
    quotation: GetQuotationResDto | null;
    actions: EventActionsResultDto;
  }> {
    // Find the event first with agenda relation
    const event = await this.agendaEventProvider.findOne({
      where: { id: eventId },
      relations: ['agenda']
    });
    
    if (!event) {
      throw new DomainNotFound('Event not found');
    }
    
    // Verify the event belongs to this customer
    if (event.customerId !== customerId) {
      this.logger.warn(`Customer ${customerId} attempted to access event ${eventId} which belongs to customer ${event.customerId}`);
      throw new UnauthorizedException('You do not have permission to access this event');
    }
    
    // Get the agenda to find the artist
    const agenda = await this.agendaProvider.findById(event.agenda.id);
    
    if (!agenda) {
      throw new DomainNotFound('Agenda not found');
    }
    
    // Get the artist location
    const location = await this.artistLocationProvider.findByArtistId(agenda.artistId);

    const artist = await this.artistProvider.findOne({
      where: { id: agenda.artistId },
      relations: ['contact']
    });

    if (!artist) {
      throw new DomainNotFound('Artist not found');
    }
    
    if (!location) {
      this.logger.warn('Location not found');
    }

    let enrichedQuotation: GetQuotationResDto | null = null;
    let quotationEntity: Quotation | undefined;
    let offerEntity: QuotationOffer | undefined;
    if (event.quotationId) {
      quotationEntity = await this.quotationRepository.findById(event.quotationId);
      if (quotationEntity) {
        const [enriched] = await this.quotationEnrichmentService.enrichQuotations([
          quotationEntity
        ], {
          includeOffers: true,
          includeCustomer: true,
          includeArtist: false,
          includeStencil: true,
          includeLocation: true,
          includeTattooDesignCache: true,
        });
        enrichedQuotation = enriched || null;
        offerEntity = quotationEntity.offers?.[0];
      }
    }

    // Obtener acciones disponibles para el customer
    const actions = await this.eventActionEngine.getAvailableActions({
      userId: customerId,
      userType: UserType.CUSTOMER,
      event,
      quotation: quotationEntity,
      offer: offerEntity,
    });
    
    return {
      event,
      artist,
      location: location[0],
      quotation: enrichedQuotation,
      actions,
    };
  }
}
