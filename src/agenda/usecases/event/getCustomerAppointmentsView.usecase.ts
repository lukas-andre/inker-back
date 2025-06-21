import { Injectable } from '@nestjs/common';
import { differenceInHours, isFuture, isThisWeek, isToday } from 'date-fns';
import { In } from 'typeorm';

import { Artist } from '../../../artists/infrastructure/entities/artist.entity';
import { ArtistRepository } from '../../../artists/infrastructure/repositories/artist.repository';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { AppointmentContextualInfo } from '../../domain/dtos/appointmentContextualInfo.dto';
import { ArtistLocationRepository } from '../../../locations/infrastructure/database/artistLocation.repository';
import { ArtistLocation } from '../../../locations/infrastructure/database/entities/artistLocation.entity';
import { CustomerAppointmentDto } from '../../domain/dtos/customerAppointment.dto';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import { AppointmentAction } from '../../domain/enum/appointmentAction.enum';
import { AppointmentUrgencyLevel } from '../../domain/enum/appointmentUrgencyLevel.enum';
import { QuotationEnrichmentService } from '../../domain/services/quotationEnrichment.service';
import { GetCustomerAppointmentsViewResDto } from '../../infrastructure/dtos/getCustomerAppointmentsViewRes.dto';
import { GetQuotationResDto } from '../../infrastructure/dtos/getQuotationRes.dto';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity';
import { Quotation } from '../../infrastructure/entities/quotation.entity';
import { QuotationOfferStatus } from '../../infrastructure/entities/quotationOffer.entity';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../infrastructure/repositories/quotation.provider';

@Injectable()
export class GetCustomerAppointmentsViewUseCase
  extends BaseUseCase
  implements UseCase
{
  constructor(
    private readonly agendaEventRepository: AgendaEventRepository,
    private readonly artistRepository: ArtistRepository,
    private readonly artistLocationRepository: ArtistLocationRepository,
    private readonly quotationEnrichmentService: QuotationEnrichmentService,
    private readonly quotationRepository: QuotationRepository,
  ) {
    super(GetCustomerAppointmentsViewUseCase.name);
  }

  async execute(
    customerId: string,
  ): Promise<GetCustomerAppointmentsViewResDto> {
    const allEvents = await this.agendaEventRepository.find({
      where: { customerId },
      relations: ['agenda'],
    });

    if (!allEvents || allEvents.length === 0) {
      return {
        heroAppointmentId: null,
        appointments: {
          requiringAction: [],
          today: [],
          thisWeek: [],
          upcoming: [],
          history: [],
        },
      };
    }

    const artistIds = [
      ...new Set(
        allEvents.map(event => event.agenda?.artistId).filter(id => id != null),
      ),
    ];

    if (artistIds.length === 0) {
      return this.buildResponse([], null);
    }

    const [artists, locations] = await Promise.all([
      this.artistRepository.find({
        where: { id: In(artistIds) },
        relations: ['contact'],
      }),
      this.artistLocationRepository.findByArtistIds(artistIds),
    ]);

    const artistsMap = new Map(artists.map(artist => [artist.id, artist]));
    const locationsMap = new Map(
      locations.map(location => [location.artistId, location]),
    );

    // Get quotation IDs from events
    const quotationIds = allEvents
      .map(event => event.quotationId)
      .filter((id): id is string => id != null);

    // Enrich quotations if there are any
    let enrichedQuotations: GetQuotationResDto[] = [];
    if (quotationIds.length > 0) {
      const quotations = await this.quotationRepository.find({
        where: { id: In(quotationIds) },
      });

      enrichedQuotations =
        await this.quotationEnrichmentService.enrichQuotations(quotations, {
          includeOffers: true,
          includeCustomer: true,
          includeArtist: false,
          includeStencil: true,
          includeLocation: false,
          includeTattooDesignCache: true,
          includeHasOffered: true,
        });
    }

    const quotationsMap = new Map(
      enrichedQuotations.map(quotation => [quotation.id, quotation]),
    );

    const enrichedEvents: CustomerAppointmentDto[] = allEvents
      .map(event => {
        const artist = artistsMap.get(event.agenda.artistId);
        const location = locationsMap.get(event.agenda.artistId);
        const quotation = event.quotationId
          ? quotationsMap.get(event.quotationId)
          : null;

        if (!artist || !location) {
          this.logger.warn(
            `Could not find artist or location for event ${event.id}`,
          );
          return null;
        }
        return this._enrichEvent(event, artist, location, quotation);
      })
      .filter((e): e is CustomerAppointmentDto => e !== null);

    return this.buildResponse(enrichedEvents, enrichedEvents[0] || null);
  }

  private buildResponse(
    enrichedEvents: CustomerAppointmentDto[],
    heroAppointment: CustomerAppointmentDto | null,
  ): GetCustomerAppointmentsViewResDto {
    // Sort by date before grouping
    enrichedEvents.sort(
      (a, b) =>
        new Date(a.event.startDate).getTime() -
        new Date(b.event.startDate).getTime(),
    );

    const requiringAction = enrichedEvents.filter(
      e => e.urgency === AppointmentUrgencyLevel.CRITICAL,
    );
    const today = enrichedEvents.filter(
      e =>
        isToday(new Date(e.event.startDate)) &&
        e.urgency !== AppointmentUrgencyLevel.PAST,
    );
    const thisWeek = enrichedEvents.filter(
      e =>
        isThisWeek(new Date(e.event.startDate), { weekStartsOn: 1 }) &&
        !isToday(new Date(e.event.startDate)) &&
        e.urgency !== AppointmentUrgencyLevel.PAST,
    );
    const upcoming = enrichedEvents.filter(
      e =>
        isFuture(new Date(e.event.startDate)) &&
        !isThisWeek(new Date(e.event.startDate), { weekStartsOn: 1 }) &&
        e.urgency !== AppointmentUrgencyLevel.PAST,
    );
    const history = enrichedEvents
      .filter(e => e.urgency === AppointmentUrgencyLevel.PAST)
      .sort(
        (a, b) =>
          new Date(b.event.startDate).getTime() -
          new Date(a.event.startDate).getTime(),
      );

    const finalHeroAppointment = this.determineHeroAppointment(enrichedEvents);

    return {
      heroAppointmentId: finalHeroAppointment
        ? finalHeroAppointment.event.id
        : null,
      appointments: {
        requiringAction,
        today,
        thisWeek,
        upcoming,
        history,
      },
    };
  }

  private _enrichEvent(
    event: AgendaEvent,
    artist: Artist,
    location: ArtistLocation,
    quotation: GetQuotationResDto | null,
  ): CustomerAppointmentDto {
    const now = new Date();
    const eventDate = new Date(event.startDate);
    const hoursUntil = differenceInHours(eventDate, now);

    let urgency: AppointmentUrgencyLevel;
    const contextualInfo = new AppointmentContextualInfo();
    const availableActions: AppointmentAction[] = [];

    const isPast = eventDate < now;
    const isActionRequired =
      event.status === AgendaEventStatus.PENDING_CONFIRMATION ||
      event.status === AgendaEventStatus.CREATED;

    // Check if consent is needed from the quotation
    const needsConsent =
      quotation?.offers?.[0]?.status === QuotationOfferStatus.SUBMITTED;

    if (isActionRequired) {
      urgency = AppointmentUrgencyLevel.CRITICAL;
      contextualInfo.title = 'Requiere Confirmación';
      contextualInfo.message =
        'El artista está esperando que confirmes tu cita. ¡Hazlo antes de que expire!';

      // If consent is needed, prioritize it
      if (needsConsent) {
        availableActions.push(AppointmentAction.CONFIRM_CONSENT);
      } else {
        availableActions.push(AppointmentAction.CONFIRM);
      }
    } else if (event.status === AgendaEventStatus.WAITING_FOR_REVIEW) {
      urgency = AppointmentUrgencyLevel.CRITICAL;
      contextualInfo.title = '¡Deja tu Reseña!';
      contextualInfo.message =
        'Nos encantaría saber cómo fue tu experiencia. Tu opinión ayuda a otros a elegir y al artista a mejorar.';
      availableActions.push(AppointmentAction.LEAVE_REVIEW);
    } else if (
      (isPast && !isToday(eventDate)) ||
      [
        AgendaEventStatus.COMPLETED,
        AgendaEventStatus.CANCELED,
        AgendaEventStatus.REVIEWED,
      ].includes(event.status)
    ) {
      urgency = AppointmentUrgencyLevel.PAST;
      contextualInfo.title = `Cita ${
        event.status === AgendaEventStatus.CANCELED ? 'Cancelada' : 'Finalizada'
      }`;
      contextualInfo.message = `Esta cita del ${eventDate.toLocaleDateString()} está en tu historial.`;
    } else if (hoursUntil >= 0 && hoursUntil < 24) {
      urgency = AppointmentUrgencyLevel.URGENT;
      contextualInfo.title = '¡Tu Cita es Pronto!';
      contextualInfo.message = `Tu cita es en menos de 24 horas. ¡Prepárate!`;
      availableActions.push(AppointmentAction.VIEW_DETAILS);
    } else {
      switch (event.status) {
        case AgendaEventStatus.CONFIRMED:
          urgency = AppointmentUrgencyLevel.INFO;
          contextualInfo.title = 'Confirmada';
          contextualInfo.message =
            '¡Todo listo! Tu cita está confirmada por ambas partes.';
          break;
        case AgendaEventStatus.RESCHEDULED:
          urgency = AppointmentUrgencyLevel.INFO;
          contextualInfo.title = 'Re-agendada';
          contextualInfo.message =
            'La cita fue re-agendada. Verifica la nueva fecha y hora.';
          break;
        case AgendaEventStatus.WAITING_FOR_PHOTOS:
          contextualInfo.title = '¡Arte en Camino!';
          contextualInfo.message =
            'Tu sesión finalizó. El artista está preparando las fotos de tu nuevo tatuaje.';
          urgency = AppointmentUrgencyLevel.INFO;
          break;
        default:
          contextualInfo.title = 'Cita Programada';
          contextualInfo.message = 'Esta cita está en tu agenda.';
          urgency = AppointmentUrgencyLevel.INFO;
          break;
      }
      availableActions.push(AppointmentAction.VIEW_DETAILS);
    }

    return {
      event,
      artist,
      location,
      urgency,
      contextualInfo,
      availableActions,
      quotation,
    };
  }

  private determineHeroAppointment(
    appointments: CustomerAppointmentDto[],
  ): CustomerAppointmentDto | null {
    // First priority: Events requiring action
    const requiringAction = appointments.filter(
      a => a.urgency === AppointmentUrgencyLevel.CRITICAL,
    );
    if (requiringAction.length > 0) {
      return requiringAction[0];
    }

    // Second priority: Today's appointments
    const today = appointments.filter(
      a =>
        isToday(new Date(a.event.startDate)) &&
        a.urgency !== AppointmentUrgencyLevel.PAST,
    );
    if (today.length > 0) {
      return today[0];
    }

    // Third priority: This week's appointments
    const thisWeek = appointments.filter(
      a =>
        isThisWeek(new Date(a.event.startDate), { weekStartsOn: 1 }) &&
        !isToday(new Date(a.event.startDate)) &&
        a.urgency !== AppointmentUrgencyLevel.PAST,
    );
    if (thisWeek.length > 0) {
      return thisWeek[0];
    }

    // Fourth priority: Upcoming appointments
    const upcoming = appointments.filter(
      a =>
        isFuture(new Date(a.event.startDate)) &&
        !isThisWeek(new Date(a.event.startDate), { weekStartsOn: 1 }) &&
        a.urgency !== AppointmentUrgencyLevel.PAST,
    );
    if (upcoming.length > 0) {
      return upcoming[0];
    }

    return null;
  }
}
