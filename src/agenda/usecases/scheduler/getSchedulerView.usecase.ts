import { Injectable, NotFoundException } from '@nestjs/common';
import { Between, In, IsNull } from 'typeorm';

import { CustomerRepository } from '../../../customers/infrastructure/providers/customer.repository';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { SchedulerQuotationOfferDto } from '../../domain/dtos/schedulerQuotationOffer.dto';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import { EventActionEngineService } from '../../domain/services/eventActionEngine.service';
import { GetSchedulerViewQueryDto } from '../../infrastructure/dtos/getSchedulerViewQuery.dto';
import {
  GetSchedulerViewResDto,
  SchedulerEventDto,
  SchedulerItemCategory,
  SchedulerQuotationDto,
  SchedulerSummaryDto,
} from '../../infrastructure/dtos/getSchedulerViewRes.dto';
import {
  Quotation,
  QuotationStatus,
  QuotationType,
} from '../../infrastructure/entities/quotation.entity';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../infrastructure/repositories/quotation.provider';
import {
  AvailabilityCalendar,
  SchedulingService,
  TimeSlot,
} from '../../services/scheduling.service';

@Injectable()
export class GetSchedulerViewUseCase extends BaseUseCase implements UseCase {
  private readonly ACTIVE_EVENT_STATES = [
    AgendaEventStatus.CREATED,
    AgendaEventStatus.PENDING_CONFIRMATION,
    AgendaEventStatus.CONFIRMED,
    AgendaEventStatus.IN_PROGRESS,
    AgendaEventStatus.PAYMENT_PENDING,
    AgendaEventStatus.RESCHEDULED,
    AgendaEventStatus.COMPLETED,
    AgendaEventStatus.WAITING_FOR_PHOTOS,
    AgendaEventStatus.WAITING_FOR_REVIEW,
  ];

  private readonly BLOCKING_EVENT_STATES = [
    AgendaEventStatus.CONFIRMED,
    AgendaEventStatus.IN_PROGRESS,
    AgendaEventStatus.PAYMENT_PENDING,
  ];

  constructor(
    private readonly agendaRepository: AgendaRepository,
    private readonly agendaEventRepository: AgendaEventRepository,
    private readonly quotationProvider: QuotationRepository,
    private readonly schedulingService: SchedulingService,
    private readonly eventActionEngineService: EventActionEngineService,
    private readonly customerRepository: CustomerRepository,
  ) {
    super(GetSchedulerViewUseCase.name);
  }

  async execute(
    artistId: string,
    query: GetSchedulerViewQueryDto,
  ): Promise<GetSchedulerViewResDto> {
    // Step 1: Fetch artist's agenda
    const agenda = await this.agendaRepository.findOne({
      where: { artistId },
    });

    if (!agenda) {
      throw new NotFoundException(`Artist ${artistId} does not have an agenda`);
    }

    // Step 2: Fetch events in date range
    const events = await this.agendaEventRepository.find({
      where: {
        agenda: { id: agenda.id },
        startDate: Between(new Date(query.fromDate), new Date(query.toDate)),
        status: In(this.ACTIVE_EVENT_STATES),
        deletedAt: IsNull(),
      },
      relations: ['agenda'],
      order: { startDate: 'ASC' },
    });

    // Step 3: Fetch relevant quotations
    const fromDate = new Date(query.fromDate);
    const toDate = new Date(query.toDate);
    
    // Fetch DIRECT quotations that need artist response with cache
    const directQuotations = await this.quotationProvider.find({
      where: {
        artistId,
        status: In([QuotationStatus.QUOTED, QuotationStatus.APPEALED]),
        type: QuotationType.DIRECT,
      },
      cache: {
        id: `direct_quotations_${artistId}_active`,
        milliseconds: 15000, // 15 seconds cache - short because these need quick updates
      },
    });
    
    // Filter direct quotations to only include those with proposed dates in range (if they have dates)
    const relevantDirectQuotations = directQuotations.filter(q => {
      if (!q.appointmentDate) {
        // If no date proposed, include it as it needs artist action
        return true;
      }
      const quotationDate = new Date(q.appointmentDate);
      return quotationDate >= fromDate && quotationDate <= toDate;
    });

    // Fetch OPEN quotations where this artist has made offers in the date range
    const relevantOpenQuotations = await this.quotationProvider.getOpenQuotationsForScheduler(
      artistId,
      fromDate,
      toDate,
    );

    const allQuotations = [...relevantDirectQuotations, ...relevantOpenQuotations];

    // Step 4: Get customer data with cache
    const customerIds = new Set([
      ...events.map(e => e.customerId).filter(Boolean),
      ...allQuotations.map(q => q.customerId).filter(Boolean),
    ]);

    const customers =
      customerIds.size > 0
        ? await this.customerRepository.find({
          where: { id: In([...customerIds]) },
          cache: {
            id: `customers_batch_${[...customerIds].sort().join('_')}`,
            milliseconds: 60000, // 1 minute cache
          },
        })
        : [];

    const customerMap = new Map(customers.map(c => [c.id, c]));

    // Step 5: Transform events
    const schedulerEvents = await Promise.all(
      events.map(async event => {
        const customer = customerMap.get(event.customerId);
        const actionContext = {
          userId: artistId,
          userType: UserType.ARTIST,
          event,
        };

        const actions = await this.eventActionEngineService.getAvailableActions(
          actionContext,
        );
        const isBlocking = this.BLOCKING_EVENT_STATES.includes(event.status);

        const conflictsWith = events
          .filter(
            e =>
              e.id !== event.id &&
              !this.BLOCKING_EVENT_STATES.includes(e.status) &&
              this.hasTimeOverlap(event, e),
          )
          .map(e => e.id);

        const schedulerEvent: SchedulerEventDto = {
          id: event.id,
          category: this.categorizeEvent(event.status),
          type: 'event',
          title: event.title,
          description: event.info,
          startDate: event.startDate,
          endDate: event.endDate,
          status: event.status,
          customerId: event.customerId,
          customerName: customer
            ? `${customer.firstName} ${customer.lastName}`.trim()
            : 'Unknown',
          customerAvatar: customer?.profileThumbnail,
          quotationId: event.quotationId,
          isBlocking,
          canModify: actions.canEdit,
          canCancel: actions.canCancel,
          canReschedule: actions.canReschedule,
          conflictsWith: conflictsWith.length > 0 ? conflictsWith : undefined,
          workEvidence: event.workEvidence,
          notes: event.notes,
          reminderSent: event.reminderSent,
        };

        return schedulerEvent;
      }),
    );

    // Step 6: Transform quotations
    const schedulerQuotations = await Promise.all(
      allQuotations.map(async quotation => {
        const customer = customerMap.get(quotation.customerId);
        const isDirectQuotation = quotation.type === QuotationType.DIRECT;
        const isOpenQuotation = quotation.type === QuotationType.OPEN;

        let hasConflict = false;
        let conflictingEventIds: string[] = [];

        if (quotation.appointmentDate && quotation.appointmentDuration) {
          const quotationEnd = new Date(quotation.appointmentDate);
          quotationEnd.setMinutes(
            quotationEnd.getMinutes() + quotation.appointmentDuration,
          );

          conflictingEventIds = events
            .filter(e => {
              const overlap = this.hasTimeOverlap(
                { startDate: quotation.appointmentDate, endDate: quotationEnd },
                e,
              );
              if (overlap && this.BLOCKING_EVENT_STATES.includes(e.status)) {
                hasConflict = true;
              }
              return overlap;
            })
            .map(e => e.id);
        }

        let category: SchedulerItemCategory;
        if (
          isDirectQuotation &&
          [QuotationStatus.QUOTED, QuotationStatus.APPEALED].includes(
            quotation.status,
          )
        ) {
          category = SchedulerItemCategory.ACTIONABLE;
        } else if (isOpenQuotation) {
          category = SchedulerItemCategory.OPPORTUNITY;
        } else {
          category = SchedulerItemCategory.TENTATIVE;
        }

        const schedulerQuotation: SchedulerQuotationDto = {
          id: quotation.id,
          category,
          type: 'quotation',
          quotationType: quotation.type,
          status: quotation.status,
          customerId: quotation.customerId,
          customerName: customer
            ? `${customer.firstName} ${customer.lastName}`.trim()
            : 'Unknown',
          customerAvatar: customer?.profileThumbnail,
          description: quotation.description,
          estimatedCost: quotation.estimatedCost,
          proposedDate: quotation.appointmentDate,
          proposedDuration: quotation.appointmentDuration,
          referenceImages: quotation.referenceImages,
          hasConflict,
          conflictingEventIds:
            conflictingEventIds.length > 0 ? conflictingEventIds : undefined,
          actionRequired: isDirectQuotation,
          actionDeadline: this.calculateActionDeadline(quotation),
          offers: this.transformOffersWithStandardTimes(quotation.offers),
          canRespond: isDirectQuotation,
          canSubmitOffer: isOpenQuotation && !quotation.offers?.some(o => o.artistId === artistId),
        };

        return schedulerQuotation;
      }),
    );

    // Step 7: Calculate availability and suggestions
    let availability: AvailabilityCalendar[] = [];
    let suggestedSlots: TimeSlot[] = [];

    if (query.includeAvailability) {
      // Note: Availability should not be heavily cached as it changes frequently
      availability = await this.schedulingService.findAvailableSlots(
        artistId,
        query.defaultDuration,
        new Date(query.fromDate),
        new Date(query.toDate),
      );
    }

    if (query.includeSuggestions) {
      const quotationProposedTimes = allQuotations
        .filter(
          q =>
            q.appointmentDate &&
            !schedulerQuotations.find(sq => sq.id === q.id)?.hasConflict,
        )
        .map(q => ({
          startTime: q.appointmentDate,
          endTime: new Date(
            new Date(q.appointmentDate).getTime() +
            (q.appointmentDuration || 60) * 60000,
          ),
          density: -1,
        }));

      suggestedSlots = await this.schedulingService.suggestOptimalTimes(
        artistId,
        query.defaultDuration,
        8,
      );

      if (quotationProposedTimes.length > 0) {
        suggestedSlots = [...quotationProposedTimes, ...suggestedSlots]
          .sort((a, b) => (a.density || 0) - (b.density || 0))
          .slice(0, 8);
      }
    }

    // Step 8: Generate summary
    const summary: SchedulerSummaryDto = {
      totalConfirmedEvents: schedulerEvents.filter(
        e => e.category === SchedulerItemCategory.CONFIRMED,
      ).length,
      totalTentativeEvents: schedulerEvents.filter(
        e => e.category === SchedulerItemCategory.TENTATIVE,
      ).length,
      totalActionableQuotations: schedulerQuotations.filter(
        q => q.category === SchedulerItemCategory.ACTIONABLE,
      ).length,
      totalOpportunities: schedulerQuotations.filter(
        q => q.category === SchedulerItemCategory.OPPORTUNITY,
      ).length,
      nextAvailableSlot: suggestedSlots[0],
      upcomingDeadlines: [
        ...schedulerQuotations
          .filter(q => q.actionDeadline)
          .map(q => ({
            quotationId: q.id,
            deadline: q.actionDeadline!,
            type: 'response' as 'response' | 'confirmation',
          })),
        ...schedulerEvents
          .filter(e => e.status === AgendaEventStatus.PENDING_CONFIRMATION)
          .map(e => ({
            quotationId: e.id,
            deadline: new Date(e.startDate.getTime() - 24 * 60 * 60 * 1000),
            type: 'confirmation' as 'response' | 'confirmation',
          })),
      ]
        .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
        .slice(0, 5),
    };

    return {
      events: schedulerEvents,
      quotations: schedulerQuotations,
      availability,
      suggestedSlots,
      workingHours: {
        start: agenda.workingHoursStart || '09:00',
        end: agenda.workingHoursEnd || '18:00',
        workingDays: agenda.workingDays || ['1', '2', '3', '4', '5'],
      },
      summary,
    };
  }

  private categorizeEvent(status: AgendaEventStatus): SchedulerItemCategory {
    if (this.BLOCKING_EVENT_STATES.includes(status)) {
      return SchedulerItemCategory.CONFIRMED;
    }
    return SchedulerItemCategory.TENTATIVE;
  }

  private hasTimeOverlap(
    range1: { startDate: Date; endDate: Date },
    range2: { startDate: Date; endDate: Date },
  ): boolean {
    const start1 = new Date(range1.startDate).getTime();
    const end1 = new Date(range1.endDate).getTime();
    const start2 = new Date(range2.startDate).getTime();
    const end2 = new Date(range2.endDate).getTime();

    return start1 < end2 && start2 < end1;
  }

  private calculateActionDeadline(quotation: Quotation): Date | undefined {
    if (quotation.type === QuotationType.DIRECT && quotation.createdAt) {
      const deadline = new Date(quotation.createdAt);
      deadline.setHours(deadline.getHours() + 48);
      return deadline;
    }

    if (quotation.appointmentDate) {
      const deadline = new Date(quotation.appointmentDate);
      deadline.setHours(deadline.getHours() - 24);
      return deadline;
    }

    return undefined;
  }

  private transformOffersWithStandardTimes(offers?: any[]): SchedulerQuotationOfferDto[] | undefined {
    if (!offers || offers.length === 0) return undefined;
    
    return offers.map(offer => {
      const start = offer.estimatedDate ? new Date(offer.estimatedDate) : new Date();
      const durationMinutes = offer.estimatedDuration || 60;
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
      
      return {
        id: offer.id,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
        quotationId: offer.quotationId,
        artistId: offer.artistId,
        estimatedCost: offer.estimatedCost,
        start,
        end,
        estimatedDate: offer.estimatedDate,
        estimatedDuration: offer.estimatedDuration,
        message: offer.message,
        status: offer.status,
        messages: offer.messages || [],
      };
    });
  }
}
