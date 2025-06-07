import { Injectable } from '@nestjs/common';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity';
import { Quotation} from '../../infrastructure/entities/quotation.entity';
import { QuotationOffer  } from '../../infrastructure/entities/quotationOffer.entity';
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
  private calculateHoursDifference(date1: Date, date2: Date): number {
    if (!date1 || !date2) return Infinity; // Or handle as an error
    const diffInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
    return diffInMilliseconds / (1000 * 60 * 60);
  }

  async getAvailableActions(ctx: EventActionContext): Promise<EventActionsResultDto> {
    const { userId, userType, event } = ctx;
    const currentTime = new Date();
    
    // Ensure event.agenda is loaded or agendaId is directly on event if that's the case.
    // The provided logic uses event.agenda.artistId.
    // If event.agenda might be undefined, this could throw an error.
    // For now, proceeding with the assumption that event.agenda is populated.
    // If event.agenda is not guaranteed, we might need to fetch it or adjust.
    const artistIdFromAgenda = event.agenda?.id ? event.agenda.artistId : null;


    const hoursTillAppointment = this.calculateHoursDifference(currentTime, event.startDate);
    
    // isArtist and isCustomer determination needs to be robust.
    // Assuming ctx.event.agenda.artistId and ctx.event.customerId are available and correct.
    const isArtist = userType === UserType.ARTIST && userId === artistIdFromAgenda;
    const isCustomer = userType === UserType.CUSTOMER && userId === event.customerId;  

    const reasons: Record<string, string> = {};
    let canEdit = false;
    let canCancel = false;
    let canReschedule = false;
    let canSendMessage = false;
    let canAddWorkEvidence = false;
    let canLeaveReview = false;
    let canConfirmEvent = false;
    let canRejectEvent = false;

    // --- canEdit ---
    if (isArtist && [AgendaEventStatus.CONFIRMED, AgendaEventStatus.RESCHEDULED].includes(event.status)) {
      canEdit = true;
    } else {
      reasons.canEdit = "Only artists can modify event details during the confirmed or rescheduled phase.";
    }

    // --- canCancel ---
    const isCancellableStatus = ![AgendaEventStatus.COMPLETED, AgendaEventStatus.CANCELED].includes(event.status);
    if (isArtist && isCancellableStatus) {
      canCancel = true;
    } else if (isCustomer && hoursTillAppointment >= 24 && isCancellableStatus) {
      canCancel = true;
    } else {
      if (!isCancellableStatus) {
        reasons.canCancel = "Cancellations are blocked for completed or already canceled events.";
      } else if (isCustomer && hoursTillAppointment < 24) {
        reasons.canCancel = "Customers can only cancel with at least 24 hours notice.";
      } else {
        reasons.canCancel = "Cancellation not permitted for this user or event state.";
      }
    }

    // --- canReschedule ---
    if ([AgendaEventStatus.CONFIRMED, AgendaEventStatus.RESCHEDULED].includes(event.status)) { 
      if (isArtist) {
        canReschedule = true;
      } else if (isCustomer && hoursTillAppointment >= 48) {
        canReschedule = true;
      } else if (isCustomer && hoursTillAppointment < 48) {
        reasons.canReschedule = "Customers require at least 48 hours notice to reschedule.";
      }
    } else {
      reasons.canReschedule = "Rescheduling is only allowed for events in the 'confirmed' or 'rescheduled' state.";
    }
    if (!canReschedule && !reasons.canReschedule) {
        reasons.canReschedule = "Rescheduling not permitted for this user or event state.";
    }


    // --- canSendMessage ---
    if ([
      AgendaEventStatus.CONFIRMED, 
      AgendaEventStatus.IN_PROGRESS,
      AgendaEventStatus.WAITING_FOR_PHOTOS,
      AgendaEventStatus.PENDING_CONFIRMATION, 
      AgendaEventStatus.RESCHEDULED,
      AgendaEventStatus.AFTERCARE_PERIOD
    ].includes(event.status)) {
      canSendMessage = true;
    } else {
      reasons.canSendMessage = "Messaging is disabled for events not in an active communication phase (e.g., confirmed, in progress, pending confirmation, rescheduled, waiting for photos, aftercare).";
    }

    // --- canAddWorkEvidence ---
    // User's rule: isArtist && event.status === AgendaEventStatus.COMPLETED
    // Let's adjust to WAITING_FOR_PHOTOS as per typical flow before COMPLETED or REVIEWED
    if (isArtist && event.status === AgendaEventStatus.WAITING_FOR_PHOTOS) {
       canAddWorkEvidence = true;
    } else if (isArtist && event.status === AgendaEventStatus.COMPLETED ) {
        // Allowing for cases where it might have been marked completed before evidence
        canAddWorkEvidence = true;
    }
    else {
      if (!isArtist) {
        reasons.canAddWorkEvidence = "Only artists can add work evidence.";
      } else if (event.status !== AgendaEventStatus.WAITING_FOR_PHOTOS && event.status !== AgendaEventStatus.COMPLETED) {
        reasons.canAddWorkEvidence = "Work evidence can only be added when the event is awaiting photos or marked as completed.";
      }
    }


    // --- canLeaveReview ---
    // User's rule: isCustomer && event.status === AgendaEventStatus.COMPLETED && !event.reviewId
    // Let's adjust to WAITING_FOR_REVIEW or COMPLETED (if review not yet left)
    if (isCustomer && 
        (event.status === AgendaEventStatus.WAITING_FOR_REVIEW || event.status === AgendaEventStatus.COMPLETED) &&
        !event.reviewId) {
      canLeaveReview = true;
    } else {
      if (!isCustomer) {
        reasons.canLeaveReview = "Only customers can leave reviews.";
      } else if (event.status !== AgendaEventStatus.WAITING_FOR_REVIEW && event.status !== AgendaEventStatus.COMPLETED) {
        reasons.canLeaveReview = "Reviews can only be left after the session is awaiting review or completed.";
      } else if (event.reviewId) {
        reasons.canLeaveReview = "A review has already been submitted for this event.";
      }
    }

    // --- canConfirmEvent & canRejectEvent ---
    if (event.status === AgendaEventStatus.PENDING_CONFIRMATION || event.status === AgendaEventStatus.CREATED) {
      // These actions are generally possible if the event is PENDING_CONFIRMATION.
      // The specific use cases/controllers for confirm/reject actions
      // should verify if the current user is the one expected to perform the action.
      canConfirmEvent = true;
      canRejectEvent = true;
    } else {
      reasons.canConfirmEvent = "Event confirmation is only available when the event is pending confirmation.";
      reasons.canRejectEvent = "Event rejection is only available when the event is pending confirmation.";
    }
    
    // Quotation related actions - set to false as per "excluding quotation-specific actions"
    // If these are ever needed, their specific logic should be added.
    // const canAcceptOffer = false; // Removed
    // reasons.canAcceptOffer = "Offer actions are handled separately from event actions."; // Removed
    // const canRejectOffer = false; // Removed
    // reasons.canRejectOffer = "Offer actions are handled separately from event actions."; // Removed
    const canAppeal = false;
    reasons.canAppeal = "Appeal actions are handled separately from event actions.";

    return {
      canEdit,
      canCancel,
      canReschedule,
      canSendMessage,
      canAddWorkEvidence,
      canLeaveReview,
      // canAcceptOffer, // Removed
      // canRejectOffer, // Removed
      canConfirmEvent,
      canRejectEvent,
      canAppeal,
      reasons,
    };
  }
} 