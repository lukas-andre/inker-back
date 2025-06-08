import { Injectable } from '@nestjs/common';
import { differenceInHours, isFuture, isThisWeek, isToday } from 'date-fns';
import { BaseUseCase, UseCase } from '../../../global/domain/usecases/base.usecase';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { AppointmentUrgencyLevel } from '../../domain/enum/appointmentUrgencyLevel.enum';
import { AppointmentAction } from '../../domain/enum/appointmentAction.enum';
import { CustomerAppointmentDto } from '../../domain/dtos/customerAppointment.dto';
import { AppointmentContextualInfo } from '../../domain/dtos/appointmentContextualInfo.dto';
import { GetCustomerAppointmentsViewResDto } from '../../infrastructure/dtos/getCustomerAppointmentsViewRes.dto';
import { ArtistRepository } from '../../../artists/infrastructure/repositories/artist.repository';
import { ArtistLocationRepository } from '../../../locations/infrastructure/database/artistLocation.repository';
import { Artist } from '../../../artists/infrastructure/entities/artist.entity';
import { ArtistLocation } from '../../../locations/infrastructure/database/entities/artistLocation.entity';
import { In } from 'typeorm';

@Injectable()
export class GetCustomerAppointmentsViewUseCase extends BaseUseCase implements UseCase {
    constructor(
        private readonly agendaEventRepository: AgendaEventRepository,
        private readonly artistRepository: ArtistRepository,
        private readonly artistLocationRepository: ArtistLocationRepository,
    ) {
        super(GetCustomerAppointmentsViewUseCase.name);
    }

    async execute(customerId: string): Promise<GetCustomerAppointmentsViewResDto> {
        const allEvents = await this.agendaEventRepository.find({
            where: { customerId },
            relations: ['agenda'],
        });

        if (!allEvents || allEvents.length === 0) {
            return {
                heroAppointment: null,
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
                allEvents
                    .map((event) => event.agenda?.artistId)
                    .filter((id) => id != null),
            ),
        ];

        if (artistIds.length === 0) {
            // No artists found, return empty enriched events
            return this.buildResponse([], null);
        }

        const [artists, locations] = await Promise.all([
            this.artistRepository.find({
                where: { id: In(artistIds) },
                relations: ['contact'],
            }),
            this.artistLocationRepository.findByArtistIds(artistIds),
        ]);

        const artistsMap = new Map(artists.map((artist) => [artist.id, artist]));
        const locationsMap = new Map<string, ArtistLocation>();
        locations.forEach((location) => {
            // For simplicity, we'll just store the first location per artist.
            // This can be changed if an artist can have multiple locations per appointment.
            if (!locationsMap.has(location.artistId)) {
                locationsMap.set(location.artistId, location);
            }
        });

        const enrichedEvents: CustomerAppointmentDto[] = allEvents
            .map((event) => {
                const artist = artistsMap.get(event.agenda.artistId);
                const location = locationsMap.get(event.agenda.artistId);

                if (!artist || !location) {
                    this.logger.warn(
                        `Could not find artist or location for event ${event.id}`,
                    );
                    return null;
                }
                return this._enrichEvent(event, artist, location);
            })
            .filter((e) => e !== null);

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
            (e) => e.urgency === AppointmentUrgencyLevel.CRITICAL,
        );
        const today = enrichedEvents.filter(
            (e) =>
                isToday(new Date(e.event.startDate)) &&
                e.urgency !== AppointmentUrgencyLevel.PAST,
        );
        const thisWeek = enrichedEvents.filter(
            (e) =>
                isThisWeek(new Date(e.event.startDate), { weekStartsOn: 1 }) &&
                !isToday(new Date(e.event.startDate)) &&
                e.urgency !== AppointmentUrgencyLevel.PAST,
        );
        const upcoming = enrichedEvents.filter(
            (e) =>
                isFuture(new Date(e.event.startDate)) &&
                !isThisWeek(new Date(e.event.startDate), { weekStartsOn: 1 }) &&
                e.urgency !== AppointmentUrgencyLevel.PAST,
        );
        const history = enrichedEvents
            .filter((e) => e.urgency === AppointmentUrgencyLevel.PAST)
            .sort(
                (a, b) =>
                    new Date(b.event.startDate).getTime() -
                    new Date(a.event.startDate).getTime(),
            );

        const finalHeroAppointment = this.determineHeroAppointment(enrichedEvents);

        return {
            heroAppointment: finalHeroAppointment,
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
    ): CustomerAppointmentDto {
        const now = new Date();
        const eventDate = new Date(event.startDate);
        const hoursUntil = differenceInHours(eventDate, now);

        let urgency: AppointmentUrgencyLevel;
        const contextualInfo = new AppointmentContextualInfo();
        const availableActions: AppointmentAction[] = [];

        const isPast = eventDate < now;
        const isActionRequired =
            event.status === AgendaEventStatus.PENDING_CONFIRMATION;

        if (isActionRequired) {
            urgency = AppointmentUrgencyLevel.CRITICAL;
            contextualInfo.title = 'Requiere Confirmación';
            contextualInfo.message =
                'El artista ha enviado los detalles de la cita. Por favor, confirma tu asistencia para asegurar tu lugar.';
            availableActions.push(AppointmentAction.CONFIRM);
        } else if (event.status === AgendaEventStatus.WAITING_FOR_REVIEW) {
            urgency = AppointmentUrgencyLevel.CRITICAL;
            contextualInfo.title = '¡Deja tu Reseña!';
            contextualInfo.message =
                'Nos encantaría saber cómo fue tu experiencia. Tu opinión ayuda a otros a elegir y al artista a mejorar.';
            availableActions.push(AppointmentAction.LEAVE_REVIEW);
        } else if (
            isPast ||
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
            contextualInfo.tip =
                'Come algo ligero antes de la sesión y asegúrate de estar bien hidratado/a.';
        } else if (hoursUntil >= 24 && hoursUntil < 72) {
            urgency = AppointmentUrgencyLevel.UPCOMING;
            contextualInfo.title = 'Cita Próxima';
            contextualInfo.message = `Tu cita se acerca. Revisa los detalles y contacta al artista si tienes dudas.`;
            contextualInfo.tip =
                'Revisa las imágenes de referencia y anota cualquier pregunta que tengas para el artista.';
        } else {
            urgency = AppointmentUrgencyLevel.INFO;
            contextualInfo.title = 'Cita Programada';
            contextualInfo.message = 'Todo está en orden para tu próxima cita.';
        }

        // Assign generic messages for other statuses if not covered above
        if (!contextualInfo.title) {
            switch (event.status) {
                case AgendaEventStatus.CONFIRMED:
                    contextualInfo.title = 'Confirmada';
                    contextualInfo.message = '¡Todo listo! Tu cita está confirmada por ambas partes.';
                    break;
                case AgendaEventStatus.RESCHEDULED:
                    contextualInfo.title = 'Re-agendada';
                    contextualInfo.message = 'La cita fue re-agendada. Verifica la nueva fecha y hora.';
                    break;
                case AgendaEventStatus.WAITING_FOR_PHOTOS:
                    contextualInfo.title = '¡Arte en Camino!';
                    contextualInfo.message = 'Tu sesión finalizó. El artista está preparando las fotos de tu nuevo tatuaje.';
                    urgency = AppointmentUrgencyLevel.INFO;
                    break;
                default:
                    contextualInfo.title = 'Cita Programada';
                    contextualInfo.message = 'Esta cita está en tu agenda.';
                    urgency = AppointmentUrgencyLevel.INFO;
                    break;
            }
        }

        if (availableActions.length === 0) {
            availableActions.push(AppointmentAction.VIEW_DETAILS);
        }

        return { event, artist, location, urgency, contextualInfo, availableActions };
    }

    private determineHeroAppointment(
        enrichedEvents: CustomerAppointmentDto[],
    ): CustomerAppointmentDto | null {
        const sortedForHero = [...enrichedEvents].sort((a, b) => {
            const priorityA = this._getPriorityScore(a);
            const priorityB = this._getPriorityScore(b);
            if (priorityA !== priorityB) {
                return priorityB - priorityA; // Higher score first
            }
            // If priority is the same, older start date comes first
            return new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime();
        });

        const hero = sortedForHero.find(e => e.urgency !== AppointmentUrgencyLevel.PAST);
        return hero || null;
    }

    private _getPriorityScore(appointment: CustomerAppointmentDto): number {
        switch (appointment.urgency) {
            case AppointmentUrgencyLevel.CRITICAL:
                return 100;
            case AppointmentUrgencyLevel.URGENT:
                return 90;
            case AppointmentUrgencyLevel.UPCOMING:
                return 80;
            case AppointmentUrgencyLevel.INFO:
                const hoursUntil = differenceInHours(new Date(appointment.event.startDate), new Date());
                // Decrease priority as it gets further away
                return Math.max(0, 70 - Math.floor(hoursUntil / 24));
            case AppointmentUrgencyLevel.PAST:
            default:
                return 0;
        }
    }
} 