import { Injectable } from '@nestjs/common';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity';
import { Quotation } from '../../infrastructure/entities/quotation.entity';
import { QuotationOffer } from '../../infrastructure/entities/quotationOffer.entity';
import { Artist } from '../../../artists/infrastructure/entities/artist.entity';
import { Stencil } from '../../../artists/infrastructure/entities/stencil.entity';
import { TattooDesignCacheEntity } from '../../../tattoo-generator/infrastructure/database/entities/tattooDesignCache.entity';
import { ArtistLocation } from '../../../locations/infrastructure/database/entities/artistLocation.entity';
import { AgendaEventStatus } from '../enum/agendaEventStatus.enum';
import { EventActionsResultDto } from '../dtos/eventActionsResult.dto';
import { UserType } from '../../../users/domain/enums/userType.enum';

export interface EventActionContext {
  userId: string;
  userType: UserType;
  event: AgendaEvent;
  quotation?: Quotation;
  offer?: QuotationOffer;
  artist?: Artist;
  stencil?: Stencil;
  tattooDesignCache?: TattooDesignCacheEntity;
  location?: ArtistLocation;
}

@Injectable()
export class EventActionEngineService {
  constructor() {}

  private calculateHoursDifference(date1: Date, date2: Date): number {
    if (!date1 || !date2) return Infinity;
    const diffInMilliseconds = date2.getTime() - date1.getTime();
    return diffInMilliseconds / (1000 * 60 * 60);
  }

  async getAvailableActions(
    ctx: EventActionContext,
  ): Promise<EventActionsResultDto> {
    const { userId, userType, event } = ctx;
    const currentTime = new Date();
    const eventStartDate = new Date(event.startDate);
    const eventEndDate = new Date(event.endDate);
    const artistIdFromAgenda = event.agenda?.id ? event.agenda.artistId : null;
    const hoursTillAppointment = this.calculateHoursDifference(
      currentTime,
      eventStartDate,
    );

    const isArtist =
      userType === UserType.ARTIST && userId === artistIdFromAgenda;
    const isCustomer =
      userType === UserType.CUSTOMER && userId === event.customerId;

    const reasons: Record<string, string> = {};
    let canEdit = false;
    let canCancel = false;
    let canReschedule = false;
    let canSendMessage = false;
    let canAddWorkEvidence = false;
    let canLeaveReview = false;
    let canConfirmEvent = false;
    let canRejectEvent = false;
    let canAcceptConsent = false;
    let canStartSession = false;
    let canFinishSession = false;

    // CUSTOMER ACTIONS
    if (isCustomer) {
      // Customer can confirm/reject when pending
      if (
        event.status === AgendaEventStatus.PENDING_CONFIRMATION ||
        event.status === AgendaEventStatus.CREATED
      ) {
        canConfirmEvent = true;
        canRejectEvent = true;
        canAcceptConsent = true;
      }

      // Customer can cancel with 24h notice
      if (
        [AgendaEventStatus.CONFIRMED, AgendaEventStatus.RESCHEDULED].includes(
          event.status,
        ) &&
        hoursTillAppointment >= 24
      ) {
        canCancel = true;
      }

      // Customer can reschedule with 48h notice
      if (
        [AgendaEventStatus.CONFIRMED, AgendaEventStatus.RESCHEDULED].includes(
          event.status,
        ) &&
        hoursTillAppointment >= 48
      ) {
        canReschedule = true;
      }

      // Customer can leave review after completion
      if (
        [
          AgendaEventStatus.WAITING_FOR_REVIEW,
          AgendaEventStatus.COMPLETED,
        ].includes(event.status) &&
        !event.reviewId
      ) {
        canLeaveReview = true;
      }
    }

    // ARTIST ACTIONS
    if (isArtist) {
      // Artist can cancel with 24h notice
      if (
        [
          AgendaEventStatus.CONFIRMED,
          AgendaEventStatus.RESCHEDULED,
          AgendaEventStatus.PENDING_CONFIRMATION,
        ].includes(event.status) &&
        hoursTillAppointment >= 24
      ) {
        canCancel = true;
      }

      // Artist can edit and reschedule with 48h notice
      if (
        [AgendaEventStatus.CONFIRMED, AgendaEventStatus.RESCHEDULED].includes(
          event.status,
        ) &&
        hoursTillAppointment >= 48
      ) {
        canEdit = true;
        canReschedule = true;
      }

      // Artist can start session if it's about to begin or ongoing
      const appointmentNotOver = currentTime <= eventEndDate;
      if (
        event.status === AgendaEventStatus.CONFIRMED &&
        hoursTillAppointment <= 1 &&
        appointmentNotOver
      ) {
        canStartSession = true;
      }

      // Artist can finish session if it's in progress
      if (event.status === AgendaEventStatus.IN_PROGRESS) {
        canFinishSession = true;
      }

      // Artist can add work evidence
      if (
        [
          AgendaEventStatus.WAITING_FOR_PHOTOS,
          AgendaEventStatus.COMPLETED,
        ].includes(event.status)
      ) {
        canAddWorkEvidence = true;
      }
    }

    // COMMON ACTIONS (both artist and customer)
    if (
      [
        AgendaEventStatus.CONFIRMED,
        AgendaEventStatus.IN_PROGRESS,
        AgendaEventStatus.WAITING_FOR_PHOTOS,
        AgendaEventStatus.PENDING_CONFIRMATION,
        AgendaEventStatus.RESCHEDULED,
        AgendaEventStatus.AFTERCARE_PERIOD,
      ].includes(event.status)
    ) {
      canSendMessage = true;
    }

    // Add reasons for disabled actions
    this.addActionReasons(
      reasons,
      {
        canEdit,
        canCancel,
        canReschedule,
        canSendMessage,
        canAddWorkEvidence,
        canLeaveReview,
        canConfirmEvent,
        canRejectEvent,
        canAcceptConsent,
        canStartSession,
        canFinishSession,
      },
      isArtist,
      isCustomer,
      hoursTillAppointment,
    );

    return {
      canEdit,
      canCancel,
      canReschedule,
      canSendMessage,
      canAddWorkEvidence,
      canLeaveReview,
      canConfirmEvent,
      canRejectEvent,
      canAcceptConsent,
      canStartSession,
      canFinishSession,
      canAppeal: false,
      reasons,
    };
  }

  private addActionReasons(
    reasons: Record<string, string>,
    actions: any,
    isArtist: boolean,
    isCustomer: boolean,
    hoursTillAppointment: number,
  ) {
    if (!actions.canEdit) {
      if (isArtist && hoursTillAppointment < 48) {
        reasons.canEdit =
          'Artists need at least 48 hours notice to edit event details.';
      } else {
        reasons.canEdit =
          'Only artists can edit event details in the current state.';
      }
    }

    if (!actions.canCancel) {
      if (isCustomer && hoursTillAppointment < 24) {
        reasons.canCancel = 'Customers need at least 24 hours notice to cancel.';
      } else if (isArtist && hoursTillAppointment < 24) {
        reasons.canCancel = 'Artists need at least 24 hours notice to cancel.';
      } else {
        reasons.canCancel = 'Event cannot be canceled in its current state.';
      }
    }

    if (!actions.canReschedule) {
      if (isCustomer && hoursTillAppointment < 48) {
        reasons.canReschedule =
          'Customers need at least 48 hours notice to reschedule.';
      } else if (isArtist && hoursTillAppointment < 48) {
        reasons.canReschedule =
          'Artists need at least 48 hours notice to reschedule.';
      } else {
        reasons.canReschedule =
          'Event cannot be rescheduled in its current state.';
      }
    }

    if (!actions.canSendMessage) {
      reasons.canSendMessage = 'Messaging not available for this event state.';
    }

    if (!actions.canAddWorkEvidence) {
      reasons.canAddWorkEvidence =
        'Only artists can add work evidence after completion.';
    }

    if (!actions.canLeaveReview) {
      reasons.canLeaveReview =
        'Only customers can leave reviews after session completion.';
    }

    if (!actions.canConfirmEvent) {
      reasons.canConfirmEvent = 'Only customers can confirm pending events.';
    }

    if (!actions.canRejectEvent) {
      reasons.canRejectEvent = 'Only customers can reject pending events.';
    }

    if (!actions.canAcceptConsent) {
      reasons.canAcceptConsent =
        'Consent acceptance only available for customers during booking.';
    }

    if (!actions.canStartSession) {
      reasons.canStartSession =
        'Session can only be started by the artist close to the appointment time.';
    }

    if (!actions.canFinishSession) {
      reasons.canFinishSession =
        "Session can only be finished by the artist if it's in progress.";
    }
  }
} 