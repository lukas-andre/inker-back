import { Injectable } from '@nestjs/common';
import { AgendaEventStatus } from '../enum/agendaEventStatus.enum';
import { DomainUnProcessableEntity } from '../../../global/domain/exceptions/domain.exception';
import { INVALID_EVENT_STATUS_TRANSITION } from '../errors/codes';
import { AgendaEvent, IStatusLogEntry } from '../../infrastructure/entities/agendaEvent.entity';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { queues } from '../../../queues/queues';
import { AgendaEventStatusChangedJobType } from '../../../queues/notifications/domain/schemas/agenda';
import { BaseComponent } from '../../../global/domain/components/base.component';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { SignedConsentRepository } from '../../../consent-module/infrastructure/repositories/signed-consent.repository';

// NEW: Define a context type for actions and guards
export interface StateMachineContext {
    eventEntity: AgendaEvent;
    actor: {
        userId: string;
        roleId: string;
        role: UserType;
    };
    payload?: {
        reason?: string;
        notes?: string;
        newStartDate?: string | Date;
        newEndDate?: string | Date;
        // Add a field to track reschedule attempts if necessary for guards
        // This is illustrative; actual tracking might be on the entity itself
        // rescheduleAttempts?: { timestamp: Date; actorType: UserType }[]; 
        areConsentsSigned?: boolean;
        [key: string]: any;
    };
    [key: string]: any;
}

export type StateTransitionGuard = (
    context: StateMachineContext,
) => boolean | Promise<boolean>; // Guards can be async

export type StateTransitionAction = (
    context: StateMachineContext,
    eventTrigger?: AgendaEventTransition
) => Promise<void>;

interface StateTransition {
    target: AgendaEventStatus;
    guards?: StateTransitionGuard[];
    actions?: StateTransitionAction[]; // Actions to perform *during* the transition
}

// Events that can trigger transitions
// It's good practice to define these as constants or an enum
export enum AgendaEventTransition {
    REQUEST_CONFIRMATION = 'request_confirmation',
    CONFIRM = 'confirm',
    REJECT = 'reject',
    CANCEL = 'cancel',
    INITIAL_SCHEDULE = 'initial_schedule', // Use if a distinct scheduling event is needed post-confirmation or payment
    START_SESSION = 'start_session',
    COMPLETE_SESSION = 'complete_session',
    REQUEST_PHOTOS = 'request_photos',
    ADD_PHOTOS = 'add_photos', // Assuming photos are added, not just requested
    REQUEST_REVIEW = 'request_review',
    ADD_REVIEW = 'add_review',
    START_AFTERCARE = 'start_aftercare',
    OPEN_DISPUTE = 'open_dispute',
    RESCHEDULE = 'reschedule',
    MARK_PAYMENT_PENDING = 'mark_payment_pending',
}

type StateConfig = {
    // For each status, define possible transitions triggered by events
    [key in AgendaEventStatus]?: {
        transitions: {
            [eventKey in AgendaEventTransition]?: StateTransition; // Keyed by AgendaEventTransition
        };
        onEntry?: StateTransitionAction[]; // Actions to perform upon entering this state
        onExit?: StateTransitionAction[]; // Actions to perform upon exiting this state
    };
};

@Injectable()
export class EventStateMachineService extends BaseComponent {
    private stateConfig: StateConfig;

    constructor(
        private readonly agendaEventRepository: AgendaEventRepository,
        private readonly signedConsentRepository: SignedConsentRepository,
        @InjectQueue(queues.notification.name) private readonly notificationQueue: Queue,
    ) {
        super(EventStateMachineService.name);
        this.initializeStateMachine();
    }

    private calculateHoursDifference(date1: Date, date2: Date): number {
        if (!date1 || !date2) return Infinity;
        const diffInMilliseconds = Math.abs(new Date(date2).getTime() - new Date(date1).getTime());
        return diffInMilliseconds / (1000 * 60 * 60);
    }

    // --- GUARDS ---
    private async canCustomerCancelGuard(context: StateMachineContext): Promise<boolean> {
        if (context.actor.role === UserType.CUSTOMER) {
            const hoursTillAppointment = this.calculateHoursDifference(new Date(), context.eventEntity.startDate);
            if (hoursTillAppointment < 24) {
                this.logger.warn(`Customer ${context.actor.userId} cancel prevented for event ${context.eventEntity.id}: < 24 hours.`);
                return false;
            }
        }
        return true;
    }

    private async canCustomerRescheduleGuard(context: StateMachineContext): Promise<boolean> {
        if (context.actor.role === UserType.CUSTOMER) {
            const hoursTillAppointment = this.calculateHoursDifference(new Date(), context.eventEntity.startDate);
            if (hoursTillAppointment < 48) {
                this.logger.warn(`Customer ${context.actor.userId} reschedule prevented for event ${context.eventEntity.id}: < 48 hours.`);
                return false;
            }
        }
        return true;
    }

    private async hasNotExceededRescheduleRequestLimitGuard(context: StateMachineContext): Promise<boolean> {
        // This guard assumes AgendaEvent entity has a field like:
        // rescheduleLog: { timestamp: Date; actorId: string; actorRole: UserType }[]
        const event = context.eventEntity;
        if (!event.rescheduleLog || !Array.isArray(event.rescheduleLog)) {
            return true; // If no log exists, allow first reschedule
        }
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentReschedulesByActor = event.rescheduleLog.filter(
            log => new Date(log.timestamp) > sevenDaysAgo && log.actorId === context.actor.userId
        ).length;

        if (recentReschedulesByActor >= 3) {
            this.logger.warn(`Reschedule limit (3 in 7 days) reached for event ${event.id} by actor ${context.actor.userId}`);
            return false;
        }
        return true;
    }

    private async hasRequiredConsentsSignedGuard(context: StateMachineContext): Promise<boolean> {
        // For MVP: Check if customer has signed the default consent for this event
        // Only customers need to sign consent for now
        if (context.actor.role !== UserType.CUSTOMER) {
            this.logger.log(`Consent check skipped for event ${context.eventEntity.id}: Actor is not a customer.`);
            return true;
        }

        try {
            // Check if there's any signed consent for this event by this customer
            // For MVP, we accept any signed consent (formTemplateId can be null for default)
            const signedConsent = await this.signedConsentRepository.findByEventAndUser(
                context.eventEntity.id, 
                context.eventEntity.customerId
            );

            if (!signedConsent) {
                this.logger.warn(`Confirmation prevented for event ${context.eventEntity.id}: Customer ${context.actor.userId} has not signed required consent.`);
                return false;
            }

            this.logger.log(`Consent check passed for event ${context.eventEntity.id}: Customer ${context.actor.userId} has signed consent.`);
            return true;
        } catch (error) {
            this.logger.error(`Error checking consent for event ${context.eventEntity.id}:`, error);
            // In case of database error, we'll block the transition for safety
            return false;
        }
    }

    // --- NOTIFICATION DISPATCHERS ---

    private async dispatchPendingConfirmationNotification(context: StateMachineContext): Promise<void> {
        if (!context.eventEntity.customerId) {
            this.logger.warn(`Event ${context.eventEntity.id} has no customerId, skipping pending confirmation notification.`);
            return;
        }

        const jobPayload: AgendaEventStatusChangedJobType = {
            jobId: 'EVENT_STATUS_CHANGED',
            notificationTypeId: 'EMAIL_AND_PUSH',
            metadata: {
                eventId: context.eventEntity.id,
                customerId: context.eventEntity.customerId,
                artistId: context.eventEntity.agenda?.artistId || context.payload?.artistId || 'unknown_artist',
                status: AgendaEventStatus.PENDING_CONFIRMATION,
                message: `Your appointment for '${context.eventEntity.title}' is awaiting your confirmation.`,
            },
        };

        try {
            await this.notificationQueue.add(jobPayload);
            this.logger.log(`Dispatched EVENT_STATUS_CHANGED job for event ${context.eventEntity.id} entering PENDING_CONFIRMATION`);
        } catch (error) {
            this.logger.error(`Failed to dispatch notification for event ${context.eventEntity.id} entering PENDING_CONFIRMATION`, error);
            // Decide if this error should be re-thrown or handled (e.g., retry logic not part of state machine)
        }
    }

    private async dispatchPaymentPendingNotification(context: StateMachineContext): Promise<void> {
        const { eventEntity, payload } = context;
        if (!eventEntity.customerId && !eventEntity.agenda?.artistId) {
            this.logger.warn(`Event ${eventEntity.id} has no customerId or artistId, skipping payment pending notification.`);
            return;
        }

        const message = `Payment is pending for your appointment '${eventEntity.title}'. Please complete the payment to secure your booking.`;
        const baseJobMetadata = {
            eventId: eventEntity.id,
            status: AgendaEventStatus.PAYMENT_PENDING,
            message,
        };

        if (eventEntity.customerId) {
            await this.notificationQueue.add({
                jobId: 'EVENT_STATUS_CHANGED',
                notificationTypeId: 'EMAIL_AND_PUSH',
                metadata: { ...baseJobMetadata, customerId: eventEntity.customerId, artistId: eventEntity.agenda?.artistId || payload?.artistId || 'unknown_artist' },
            }).catch(e => this.logger.error(`Failed to dispatch PAYMENT_PENDING notification to customer ${eventEntity.customerId} for event ${eventEntity.id}`, e));
            this.logger.log(`Dispatched PAYMENT_PENDING notification to customer for event ${eventEntity.id}`);
        }
        // Artist is typically not directly notified about payment pending unless it's their action to mark it.
        // If artist needs notification, it can be added here similarly.
    }

    private async dispatchSessionStartedNotification(context: StateMachineContext): Promise<void> {
        const { eventEntity, payload } = context;
        if (!eventEntity.customerId && !eventEntity.agenda?.artistId) {
            this.logger.warn(`Event ${eventEntity.id} has no customerId or artistId, skipping session started notification.`);
            return;
        }

        const message = `Your session for '${eventEntity.title}' has started.`;
        const baseJobMetadata = {
            eventId: eventEntity.id,
            status: AgendaEventStatus.IN_PROGRESS,
            message,
        };

        if (eventEntity.customerId) {
            await this.notificationQueue.add({
                jobId: 'EVENT_STATUS_CHANGED',
                notificationTypeId: 'EMAIL_AND_PUSH',
                metadata: { ...baseJobMetadata, customerId: eventEntity.customerId, artistId: eventEntity.agenda?.artistId || payload?.artistId || 'unknown_artist' },
            }).catch(e => this.logger.error(`Failed to dispatch IN_PROGRESS notification to customer ${eventEntity.customerId} for event ${eventEntity.id}`, e));
            this.logger.log(`Dispatched IN_PROGRESS notification to customer for event ${eventEntity.id}`);
        }
        if (eventEntity.agenda?.artistId) {
            await this.notificationQueue.add({
                jobId: 'EVENT_STATUS_CHANGED',
                notificationTypeId: 'EMAIL_AND_PUSH',
                metadata: { ...baseJobMetadata, artistId: eventEntity.agenda.artistId, customerId: eventEntity.customerId || 'unknown_customer' },
            }).catch(e => this.logger.error(`Failed to dispatch IN_PROGRESS notification to artist ${eventEntity.agenda?.artistId} for event ${eventEntity.id}`, e));
            this.logger.log(`Dispatched IN_PROGRESS notification to artist for event ${eventEntity.id}`);
        }
    }

    private async dispatchSessionCompletedNotification(context: StateMachineContext): Promise<void> {
        const { eventEntity, payload } = context;
        if (!eventEntity.customerId && !eventEntity.agenda?.artistId) {
            this.logger.warn(`Event ${eventEntity.id} has no customerId or artistId, skipping session completed notification.`);
            return;
        }

        const message = `Your session for '${eventEntity.title}' has been completed. We hope you enjoyed your experience!`;
        const baseJobMetadata = {
            eventId: eventEntity.id,
            status: AgendaEventStatus.COMPLETED,
            message,
        };

        if (eventEntity.customerId) {
            await this.notificationQueue.add({
                jobId: 'EVENT_STATUS_CHANGED',
                notificationTypeId: 'EMAIL_AND_PUSH',
                metadata: { ...baseJobMetadata, customerId: eventEntity.customerId, artistId: eventEntity.agenda?.artistId || payload?.artistId || 'unknown_artist' },
            }).catch(e => this.logger.error(`Failed to dispatch COMPLETED notification to customer ${eventEntity.customerId} for event ${eventEntity.id}`, e));
            this.logger.log(`Dispatched COMPLETED notification to customer for event ${eventEntity.id}`);
        }
        if (eventEntity.agenda?.artistId) {
            await this.notificationQueue.add({
                jobId: 'EVENT_STATUS_CHANGED',
                notificationTypeId: 'EMAIL_AND_PUSH',
                metadata: { ...baseJobMetadata, artistId: eventEntity.agenda.artistId, customerId: eventEntity.customerId || 'unknown_customer' },
            }).catch(e => this.logger.error(`Failed to dispatch COMPLETED notification to artist ${eventEntity.agenda?.artistId} for event ${eventEntity.id}`, e));
            this.logger.log(`Dispatched COMPLETED notification to artist for event ${eventEntity.id}`);
        }
    }

    private async dispatchRequestPhotosNotification(context: StateMachineContext): Promise<void> {
        const { eventEntity, payload } = context;
        // Typically, photos are requested from the artist.
        if (!eventEntity.agenda?.artistId) {
            this.logger.warn(`Event ${eventEntity.id} has no artistId, skipping request photos notification.`);
            return;
        }

        const message = `Please upload photos for the completed session '${eventEntity.title}'.`;
        const jobPayload: AgendaEventStatusChangedJobType = {
            jobId: 'EVENT_STATUS_CHANGED',
            notificationTypeId: 'EMAIL_AND_PUSH', // Or just PUSH for artist app
            metadata: {
                eventId: eventEntity.id,
                artistId: eventEntity.agenda.artistId,
                customerId: eventEntity.customerId || 'unknown_customer',
                status: AgendaEventStatus.WAITING_FOR_PHOTOS,
                message,
            },
        };
        try {
            await this.notificationQueue.add(jobPayload);
            this.logger.log(`Dispatched WAITING_FOR_PHOTOS notification to artist for event ${eventEntity.id}`);
        } catch (error) {
            this.logger.error(`Failed to dispatch WAITING_FOR_PHOTOS notification to artist for event ${eventEntity.id}`, error);
        }
    }

    private async dispatchRequestReviewNotification(context: StateMachineContext): Promise<void> {
        const { eventEntity, payload } = context;
        if (!eventEntity.customerId) {
            this.logger.warn(`Event ${eventEntity.id} has no customerId, skipping request review notification.`);
            return;
        }

        const message = `We'd love to hear your feedback! Please leave a review for your session '${eventEntity.title}'.`;
        const jobPayload: AgendaEventStatusChangedJobType = {
            jobId: 'EVENT_STATUS_CHANGED',
            notificationTypeId: 'EMAIL_AND_PUSH',
            metadata: {
                eventId: eventEntity.id,
                customerId: eventEntity.customerId,
                artistId: eventEntity.agenda?.artistId || payload?.artistId || 'unknown_artist',
                status: AgendaEventStatus.WAITING_FOR_REVIEW,
                message,
            },
        };
        try {
            await this.notificationQueue.add(jobPayload);
            this.logger.log(`Dispatched WAITING_FOR_REVIEW notification to customer for event ${eventEntity.id}`);
        } catch (error) {
            this.logger.error(`Failed to dispatch WAITING_FOR_REVIEW notification to customer for event ${eventEntity.id}`, error);
        }
    }

    private async dispatchReviewAddedNotification(context: StateMachineContext): Promise<void> {
        const { eventEntity, payload } = context;
        // Notify the artist that a review has been added.
        if (!eventEntity.agenda?.artistId) {
            this.logger.warn(`Event ${eventEntity.id} has no artistId, skipping review added notification.`);
            return;
        }

        const message = `A new review has been submitted for your session '${eventEntity.title}'.`;
        const jobPayload: AgendaEventStatusChangedJobType = {
            jobId: 'EVENT_STATUS_CHANGED',
            notificationTypeId: 'EMAIL_AND_PUSH',
            metadata: {
                eventId: eventEntity.id,
                artistId: eventEntity.agenda.artistId,
                customerId: eventEntity.customerId || 'unknown_customer',
                status: AgendaEventStatus.REVIEWED,
                message,
            },
        };
        try {
            await this.notificationQueue.add(jobPayload);
            this.logger.log(`Dispatched REVIEWED notification to artist for event ${eventEntity.id}`);
        } catch (error) {
            this.logger.error(`Failed to dispatch REVIEWED notification to artist for event ${eventEntity.id}`, error);
        }
        // Optionally notify the customer their review was received.
        if (eventEntity.customerId) {
            const customerMessage = `Thank you for your review of '${eventEntity.title}'!`;
            const customerJobPayload: AgendaEventStatusChangedJobType = {
                jobId: 'EVENT_STATUS_CHANGED',
                notificationTypeId: 'EMAIL_AND_PUSH',
                metadata: {
                    eventId: eventEntity.id,
                    customerId: eventEntity.customerId,
                    artistId: eventEntity.agenda?.artistId || 'unknown_artist',
                    status: AgendaEventStatus.REVIEWED,
                    message: customerMessage,
                },
            };
            try {
                await this.notificationQueue.add(customerJobPayload);
                this.logger.log(`Dispatched REVIEWED confirmation to customer for event ${eventEntity.id}`);
            } catch (error) {
                this.logger.error(`Failed to dispatch REVIEWED confirmation to customer for event ${eventEntity.id}`, error);
            }
        }
    }

    private async dispatchAftercareStartedNotification(context: StateMachineContext): Promise<void> {
        const { eventEntity, payload } = context;
        if (!eventEntity.customerId) {
            this.logger.warn(`Event ${eventEntity.id} has no customerId, skipping aftercare started notification.`);
            return;
        }

        const message = `Your aftercare period for '${eventEntity.title}' has started. Please follow the provided instructions.`;
        const jobPayload: AgendaEventStatusChangedJobType = {
            jobId: 'EVENT_STATUS_CHANGED',
            notificationTypeId: 'EMAIL_AND_PUSH',
            metadata: {
                eventId: eventEntity.id,
                customerId: eventEntity.customerId,
                artistId: eventEntity.agenda?.artistId || payload?.artistId || 'unknown_artist',
                status: AgendaEventStatus.AFTERCARE_PERIOD,
                message,
            },
        };
        try {
            await this.notificationQueue.add(jobPayload);
            this.logger.log(`Dispatched AFTERCARE_PERIOD notification to customer for event ${eventEntity.id}`);
        } catch (error) {
            this.logger.error(`Failed to dispatch AFTERCARE_PERIOD notification to customer for event ${eventEntity.id}`, error);
        }
    }

    private async dispatchDisputeOpenedNotification(context: StateMachineContext): Promise<void> {
        const { eventEntity, payload } = context;
        if (!eventEntity.customerId && !eventEntity.agenda?.artistId) {
            this.logger.warn(`Event ${eventEntity.id} has no customerId or artistId, skipping dispute opened notification.`);
            return;
        }

        const disputeReason = payload?.reason || 'No reason provided';
        const message = `A dispute has been opened for the appointment '${eventEntity.title}'. Reason: ${disputeReason}. Our team will review it shortly.`;
        const baseJobMetadata = {
            eventId: eventEntity.id,
            status: AgendaEventStatus.DISPUTE_OPEN,
            message,
            reason: disputeReason,
        };

        // Notify Customer
        if (eventEntity.customerId) {
            const customerJobPayload: AgendaEventStatusChangedJobType = {
                jobId: 'EVENT_STATUS_CHANGED',
                notificationTypeId: 'EMAIL_AND_PUSH',
                metadata: { ...baseJobMetadata, customerId: eventEntity.customerId, artistId: eventEntity.agenda?.artistId || 'unknown_artist' },
            };
            try {
                await this.notificationQueue.add(customerJobPayload);
                this.logger.log(`Dispatched DISPUTE_OPEN notification to customer for event ${eventEntity.id}`);
            } catch (error) {
                this.logger.error(`Failed to dispatch DISPUTE_OPEN notification to customer for event ${eventEntity.id}`, error);
            }
        }

        // Notify Artist
        if (eventEntity.agenda?.artistId) {
            const artistJobPayload: AgendaEventStatusChangedJobType = {
                jobId: 'EVENT_STATUS_CHANGED',
                notificationTypeId: 'EMAIL_AND_PUSH',
                metadata: { ...baseJobMetadata, artistId: eventEntity.agenda.artistId, customerId: eventEntity.customerId || 'unknown_customer' },
            };
            try {
                await this.notificationQueue.add(artistJobPayload);
                this.logger.log(`Dispatched DISPUTE_OPEN notification to artist for event ${eventEntity.id}`);
            } catch (error) {
                this.logger.error(`Failed to dispatch DISPUTE_OPEN notification to artist for event ${eventEntity.id}`, error);
            }
        }
    }

    private async dispatchConfirmedNotification(context: StateMachineContext): Promise<void> {
        if (!context.eventEntity.customerId && !context.eventEntity.agenda?.artistId) {
            this.logger.warn(`Event ${context.eventEntity.id} has no customerId or artistId, skipping confirmed notification.`);
            return;
        }

        const message = `Appointment '${context.eventEntity.title}' has been confirmed and is scheduled for ${new Date(context.eventEntity.startDate).toLocaleString()}.`;
        const baseJobMetadata = {
            eventId: context.eventEntity.id,
            status: AgendaEventStatus.CONFIRMED, // Status is CONFIRMED
            message,
        };

        // Notify Customer
        if (context.eventEntity.customerId) {
            const customerJobPayload: AgendaEventStatusChangedJobType = {
                jobId: 'EVENT_STATUS_CHANGED',
                notificationTypeId: 'EMAIL_AND_PUSH',
                metadata: {
                    ...baseJobMetadata,
                    customerId: context.eventEntity.customerId,
                    artistId: context.eventEntity.agenda?.artistId || 'unknown_artist', // For customer's context
                },
            };
            try {
                await this.notificationQueue.add(customerJobPayload);
                this.logger.log(`Dispatched CONFIRMED notification to customer for event ${context.eventEntity.id}`);
            } catch (error) {
                this.logger.error(`Failed to dispatch CONFIRMED notification to customer for event ${context.eventEntity.id}`, error);
            }
        }

        // Notify Artist
        if (context.eventEntity.agenda?.artistId) {
            const artistJobPayload: AgendaEventStatusChangedJobType = {
                jobId: 'EVENT_STATUS_CHANGED',
                notificationTypeId: 'EMAIL_AND_PUSH',
                metadata: {
                    ...baseJobMetadata,
                    artistId: context.eventEntity.agenda.artistId,
                    customerId: context.eventEntity.customerId || 'unknown_customer', // For artist's context
                },
            };
            try {
                await this.notificationQueue.add(artistJobPayload);
                this.logger.log(`Dispatched CONFIRMED notification to artist for event ${context.eventEntity.id}`);
            } catch (error) {
                this.logger.error(`Failed to dispatch CONFIRMED notification to artist for event ${context.eventEntity.id}`, error);
            }
        }
    }

    private async dispatchCanceledNotification(context: StateMachineContext, eventTrigger?: AgendaEventTransition): Promise<void> {
        let message = '';
        if (!context.eventEntity.customerId && !context.eventEntity.agenda?.artistId) {
            this.logger.warn(`Event ${context.eventEntity.id} has no customerId or artistId, skipping canceled notification.`);
            return;
        }

        const cancellationReason = context.payload?.reason || 'No reason provided';
        // Default message for cancellation
        message = `Appointment '${context.eventEntity.title}' has been canceled. Reason: ${cancellationReason}`;

        if (eventTrigger === AgendaEventTransition.REJECT) {
            message = `Appointment '${context.eventEntity.title}' was not confirmed by the other party and has been marked as canceled.`;
        }

        const baseJobMetadata = {
            eventId: context.eventEntity.id,
            status: AgendaEventStatus.CANCELED,
            message: message,
        };

        // Notify Customer
        if (context.eventEntity.customerId) {
            const customerJobPayload: AgendaEventStatusChangedJobType = {
                jobId: 'EVENT_STATUS_CHANGED',
                notificationTypeId: 'EMAIL_AND_PUSH',
                metadata: {
                    ...baseJobMetadata,
                    customerId: context.eventEntity.customerId,
                    artistId: context.eventEntity.agenda?.artistId || 'unknown_artist',
                },
            };
            try {
                await this.notificationQueue.add(customerJobPayload);
                this.logger.log(`Dispatched CANCELED notification to customer for event ${context.eventEntity.id}`);
            } catch (error) {
                this.logger.error(`Failed to dispatch CANCELED notification to customer for event ${context.eventEntity.id}`, error);
            }
        }

        // Notify Artist
        if (context.eventEntity.agenda?.artistId) {
            const artistJobPayload: AgendaEventStatusChangedJobType = {
                jobId: 'EVENT_STATUS_CHANGED',
                notificationTypeId: 'EMAIL_AND_PUSH',
                metadata: {
                    ...baseJobMetadata,
                    artistId: context.eventEntity.agenda.artistId,
                    customerId: context.eventEntity.customerId || 'unknown_customer',
                },
            };
            try {
                await this.notificationQueue.add(artistJobPayload);
                this.logger.log(`Dispatched CANCELED notification to artist for event ${context.eventEntity.id}`);
            } catch (error) {
                this.logger.error(`Failed to dispatch CANCELED notification to artist for event ${context.eventEntity.id}`, error);
            }
        }
    }


    private async dispatchRescheduledNotification(context: StateMachineContext): Promise<void> {
        if (!context.eventEntity.customerId && !context.eventEntity.agenda?.artistId) {
            this.logger.warn(`Event ${context.eventEntity.id} has no customerId or artistId, skipping rescheduled notification.`);
            return;
        }

        const message = `Appointment '${context.eventEntity.title}' has been rescheduled to ${new Date(context.eventEntity.startDate).toLocaleString()}. Please review and confirm if necessary.`;
        const baseJobMetadata = {
            eventId: context.eventEntity.id,
            status: AgendaEventStatus.RESCHEDULED, // Current status is RESCHEDULED
            message,
            newStartDate: context.eventEntity.startDate.toISOString(),
            newEndDate: context.eventEntity.endDate?.toISOString(),
        };

        // Notify Customer
        if (context.eventEntity.customerId) {
            const customerJobPayload: AgendaEventStatusChangedJobType = {
                jobId: 'EVENT_STATUS_CHANGED', // Could be a more specific job type like 'EVENT_RESCHEDULED'
                notificationTypeId: 'EMAIL_AND_PUSH',
                metadata: {
                    ...baseJobMetadata,
                    customerId: context.eventEntity.customerId,
                    artistId: context.eventEntity.agenda?.artistId || 'unknown_artist',
                },
            };
            try {
                await this.notificationQueue.add(customerJobPayload);
                this.logger.log(`Dispatched RESCHEDULED notification to customer for event ${context.eventEntity.id}`);
            } catch (error) {
                this.logger.error(`Failed to dispatch RESCHEDULED notification to customer for event ${context.eventEntity.id}`, error);
            }
        }

        // Notify Artist
        if (context.eventEntity.agenda?.artistId) {
            const artistJobPayload: AgendaEventStatusChangedJobType = {
                jobId: 'EVENT_STATUS_CHANGED',
                notificationTypeId: 'EMAIL_AND_PUSH',
                metadata: {
                    ...baseJobMetadata,
                    artistId: context.eventEntity.agenda.artistId,
                    customerId: context.eventEntity.customerId || 'unknown_customer',
                },
            };
            try {
                await this.notificationQueue.add(artistJobPayload);
                this.logger.log(`Dispatched RESCHEDULED notification to artist for event ${context.eventEntity.id}`);
            } catch (error) {
                this.logger.error(`Failed to dispatch RESCHEDULED notification to artist for event ${context.eventEntity.id}`, error);
            }
        }
    }

    private async updateEventDatesForReschedule(context: StateMachineContext): Promise<void> {
        const { eventEntity, payload } = context;

        // Store original dates for logging before they are potentially changed
        const originalStartDateForLog = new Date(eventEntity.startDate.getTime()); // Create a new Date object
        const originalEndDateForLog = eventEntity.endDate ? new Date(eventEntity.endDate.getTime()) : undefined;

        if (payload?.newStartDate) {
            eventEntity.startDate = new Date(payload.newStartDate as string | Date); // Ensure it's a Date object
            this.logger.log(`Event ${eventEntity.id} startDate updated to ${eventEntity.startDate} during RESCHEDULE transition.`);
        }
        if (payload?.newEndDate) {
            eventEntity.endDate = new Date(payload.newEndDate as string | Date); // Ensure it's a Date object
            this.logger.log(`Event ${eventEntity.id} endDate updated to ${eventEntity.endDate} during RESCHEDULE transition.`);
        }
        // Add to rescheduleLog
        if (!eventEntity.rescheduleLog) {
            eventEntity.rescheduleLog = [];
        }
        eventEntity.rescheduleLog.push({
            timestamp: new Date(),
            actorId: context.actor.userId,
            actorRole: context.actor.role,
            previousStartDate: originalStartDateForLog, 
            previousEndDate: originalEndDateForLog,
            newStartDate: eventEntity.startDate, // This is now the updated start date
            newEndDate: eventEntity.endDate,   // This is now the updated end date
            reason: payload?.reason,
        });
        // No save here; the main transition method will save the entity after all actions.
    }

    private async addStatusLogEntry(
        eventEntity: AgendaEvent,
        newStatus: AgendaEventStatus,
        actor: { userId: string; roleId: string; role: UserType },
        eventTrigger: AgendaEventTransition,
        reason?: string,
        notes?: string
    ): Promise<void> {
        const logEntry: IStatusLogEntry = {
            status: newStatus,
            timestamp: new Date(),
            actor,
            action: eventTrigger,
            reason: reason || undefined,
            notes: notes || undefined,
        };
        eventEntity.statusLog = [...(eventEntity.statusLog || []), logEntry];
    }

    private initializeStateMachine(): void {
        // Full state machine configuration will be extensive.
        // Starting with the initial states and transitions mentioned in the doc.
        this.stateConfig = {
            [AgendaEventStatus.CREATED]: {
                transitions: {
                    [AgendaEventTransition.REQUEST_CONFIRMATION]: {
                        target: AgendaEventStatus.PENDING_CONFIRMATION,
                        // actions: [async (event, context) => console.log('Action: Send confirmation request')]
                    },
                    [AgendaEventTransition.CANCEL]: {
                        target: AgendaEventStatus.CANCELED,
                        // actions: [async (event, context) => console.log('Action: Notify cancellation')]
                    },
                    [AgendaEventTransition.CONFIRM]: {
                        target: AgendaEventStatus.CONFIRMED,
                        guards: [this.hasRequiredConsentsSignedGuard.bind(this)],
                    },
                    [AgendaEventTransition.REJECT]: {
                        target: AgendaEventStatus.CANCELED,
                    }
                },
            },
            [AgendaEventStatus.PENDING_CONFIRMATION]: {
                onEntry: [
                    this.dispatchPendingConfirmationNotification.bind(this),
                ],
                transitions: {
                    [AgendaEventTransition.CONFIRM]: {
                        target: AgendaEventStatus.CONFIRMED,
                        guards: [this.hasRequiredConsentsSignedGuard.bind(this)],
                        // actions: [async (event, context) => console.log('Action: Notify confirmation')]
                    },
                    [AgendaEventTransition.REJECT]: { // Reject should lead to CANCELED
                        target: AgendaEventStatus.CANCELED,
                        // actions: [async (event, context) => console.log('Action: Notify rejection and cancellation')]
                    },
                    [AgendaEventTransition.CANCEL]: { // Allow cancellation while pending confirmation
                        target: AgendaEventStatus.CANCELED,
                    }
                },
            },
            [AgendaEventStatus.CONFIRMED]: {
                onEntry: [
                    this.dispatchConfirmedNotification.bind(this),
                ],
                transitions: {
                    [AgendaEventTransition.START_SESSION]: {
                        target: AgendaEventStatus.IN_PROGRESS,
                    },
                    // Example: Transition to PAYMENT_PENDING or SCHEDULED based on context
                    [AgendaEventTransition.MARK_PAYMENT_PENDING]: {
                        target: AgendaEventStatus.PAYMENT_PENDING,
                    },
                    [AgendaEventTransition.INITIAL_SCHEDULE]: { // Direct to CONFIRMED if payment is not a separate step or already handled
                        target: AgendaEventStatus.CONFIRMED, // Was SCHEDULED
                        // onEntry for CONFIRMED already handles notification
                    },
                    [AgendaEventTransition.RESCHEDULE]: {
                        target: AgendaEventStatus.RESCHEDULED,
                        guards: [
                            this.canCustomerRescheduleGuard.bind(this),
                            this.hasNotExceededRescheduleRequestLimitGuard.bind(this)
                        ],
                        actions: [
                            this.updateEventDatesForReschedule.bind(this),
                            // Notification is handled by onEntry of RESCHEDULED state
                        ],
                    },
                    [AgendaEventTransition.CANCEL]: {
                        target: AgendaEventStatus.CANCELED,
                    },
                },
            },
            [AgendaEventStatus.PAYMENT_PENDING]: {
                onEntry: [
                    this.dispatchPaymentPendingNotification.bind(this),
                ],
                transitions: {
                    [AgendaEventTransition.INITIAL_SCHEDULE]: { // Assuming payment completion triggers scheduling
                        target: AgendaEventStatus.CONFIRMED, // Was SCHEDULED
                        // guards: [async (event, context) => context.paymentService.isPaymentConfirmed(event.id)]
                        // onEntry for CONFIRMED handles notification
                    },
                    [AgendaEventTransition.CANCEL]: {
                        target: AgendaEventStatus.CANCELED,
                        actions: [(context, eventTrigger) => this.dispatchCanceledNotification(context, eventTrigger)]
                    }
                }
            },
            [AgendaEventStatus.IN_PROGRESS]: {
                onEntry: [
                    this.dispatchSessionStartedNotification.bind(this),
                ],
                transitions: {
                    [AgendaEventTransition.COMPLETE_SESSION]: {
                        target: AgendaEventStatus.COMPLETED,
                    },
                    // Potentially add CANCEL or RESCHEDULE under specific conditions (e.g., emergency)
                    [AgendaEventTransition.CANCEL]: { // Might be too late or have specific rules
                        target: AgendaEventStatus.CANCELED,
                        // guards: [async (event, context) => context.permissions.canCancelInProgress()]
                        actions: [(context, eventTrigger) => this.dispatchCanceledNotification(context, eventTrigger)]
                    }
                }
            },
            [AgendaEventStatus.COMPLETED]: {
                onEntry: [
                    this.dispatchSessionCompletedNotification.bind(this),
                ],
                transitions: {
                    [AgendaEventTransition.ADD_PHOTOS]: {
                        target: AgendaEventStatus.WAITING_FOR_REVIEW,
                        // The action to save photos will be in the use case.
                        // The onEntry hook of WAITING_FOR_REVIEW will handle notifications.
                    },
                    [AgendaEventTransition.ADD_REVIEW]: {
                        target: AgendaEventStatus.WAITING_FOR_PHOTOS,
                        // The action to save the review will be in its own use case.
                        // The onEntry hook of WAITING_FOR_PHOTOS will handle notifications.
                    },
                }
            },
            [AgendaEventStatus.WAITING_FOR_PHOTOS]: {
                onEntry: [
                    // This state means a review was added, so we notify the artist to add photos.
                    this.dispatchRequestPhotosNotification.bind(this),
                ],
                transitions: {
                    [AgendaEventTransition.ADD_PHOTOS]: {
                        target: AgendaEventStatus.AFTERCARE_PERIOD,
                    },
                    [AgendaEventTransition.ADD_REVIEW]: {
                        target: AgendaEventStatus.WAITING_FOR_PHOTOS,
                    },
                }
            },
            [AgendaEventStatus.WAITING_FOR_REVIEW]: {
                onEntry: [
                    // This state means photos were added, so we notify the customer to add a review.
                    this.dispatchRequestReviewNotification.bind(this),
                ],
                transitions: {
                    [AgendaEventTransition.ADD_REVIEW]: {
                        target: AgendaEventStatus.AFTERCARE_PERIOD,
                    },
                    [AgendaEventTransition.ADD_PHOTOS]: {
                        target: AgendaEventStatus.WAITING_FOR_REVIEW,
                    },
                }
            },
            [AgendaEventStatus.REVIEWED]: {
                // This state will no longer be part of the main post-completion flow,
                // but we leave it for potential other uses or legacy reasons.
                // The flow now goes directly to AFTERCARE_PERIOD.
                onEntry: [
                    this.dispatchReviewAddedNotification.bind(this),
                ],
                transitions: {
                    [AgendaEventTransition.START_AFTERCARE]: {
                        target: AgendaEventStatus.AFTERCARE_PERIOD,
                    }
                }
            },
            [AgendaEventStatus.RESCHEDULED]: { // After rescheduling, it likely goes back to pending confirmation or confirmed
                onEntry: [
                    this.dispatchRescheduledNotification.bind(this)
                ],
                transitions: {
                    [AgendaEventTransition.REQUEST_CONFIRMATION]: { // If re-confirmation is always needed by the other party
                        target: AgendaEventStatus.PENDING_CONFIRMATION,
                        // Dates are already updated by the RESCHEDULE transition's action.
                        // PENDING_CONFIRMATION onEntry will send a notification to the other party.
                    },
                    [AgendaEventTransition.CONFIRM]: { // If the actor who rescheduled can also auto-confirm it (e.g. artist has full control or customer accepts new terms implicitly)
                        target: AgendaEventStatus.CONFIRMED,
                        // This might be used if the reschedule was initiated by an artist and they have authority,
                        // or if a customer reschedules and policy dictates it's auto-confirmed.
                        // The CONFIRMED onEntry will send a notification.
                        // No date update needed here as it was done in the RESCHEDULE transition's action.
                    },
                    // Allow cancellation from RESCHEDULED state
                    [AgendaEventTransition.CANCEL]: {
                        target: AgendaEventStatus.CANCELED,
                        guards: [this.canCustomerCancelGuard.bind(this)],
                        actions: [(context, eventTrigger) => this.dispatchCanceledNotification(context, eventTrigger)]
                    },
                    // Allow further rescheduling from RESCHEDULED state
                    [AgendaEventTransition.RESCHEDULE]: {
                        target: AgendaEventStatus.RESCHEDULED, // Stays in RESCHEDULED, new dates, new notification via onEntry
                        guards: [
                            this.canCustomerRescheduleGuard.bind(this),
                            this.hasNotExceededRescheduleRequestLimitGuard.bind(this)
                        ],
                        actions: [
                            this.updateEventDatesForReschedule.bind(this),
                        ],
                    }
                }
            },
            [AgendaEventStatus.CANCELED]: {
                onEntry: [
                    // The dispatchCanceledNotification is now called directly in the actions of transitions leading to CANCELED
                    // This allows passing the eventTrigger to customize the message (e.g. for REJECT vs general CANCEL)
                    // (context, eventTrigger) => this.dispatchCanceledNotification(context, eventTrigger) // Keep if a generic onEntry needed
                ],
                // Generally a terminal state, no outgoing transitions unless "re-opening" is a feature
                transitions: {}, // Ensure transitions property exists
            },
            [AgendaEventStatus.AFTERCARE_PERIOD]: {
                onEntry: [
                    this.dispatchAftercareStartedNotification.bind(this),
                ],
                transitions: {}, // Ensure transitions property exists
            },
            [AgendaEventStatus.DISPUTE_OPEN]: {
                onEntry: [
                    this.dispatchDisputeOpenedNotification.bind(this),
                ],
                // Transitions for dispute resolution (e.g., RESOLVE_DISPUTE, CLOSE_DISPUTE)
                // These would lead to other states like CANCELED, REFUNDED (new state?), or back to a previous state.
                transitions: {}, // Ensure transitions property exists
            }
            // ... other states and transitions will be filled in based on the diagram and requirements
        };
    }

    async transition(
        currentState: AgendaEventStatus,
        eventKey: AgendaEventTransition,
        context: StateMachineContext,
    ): Promise<AgendaEventStatus> {
        const stateDefinition = this.stateConfig[currentState];
        if (!stateDefinition) {
            this.logger.error(`Invalid current state: ${currentState} for event ${context.eventEntity?.id}`);
            throw new DomainUnProcessableEntity(
                `Invalid current state: ${currentState}`,
            );
        }

        const transition = stateDefinition.transitions[eventKey];
        if (!transition) {
            this.logger.error(`Event ${eventKey} not allowed for state ${currentState} for event ${context.eventEntity?.id}`);
            throw new DomainUnProcessableEntity(
                `${INVALID_EVENT_STATUS_TRANSITION}: Event ${eventKey} not allowed in state ${currentState}`,
            );
        }

        // 1. Execute Guards
        if (transition.guards) {
            for (const guard of transition.guards) {
                if (!(await guard(context))) {
                    this.logger.warn(`Guard prevented transition for event ${context.eventEntity?.id} from ${currentState} via ${eventKey}`);
                    throw new DomainUnProcessableEntity(
                        `Transition from ${currentState} to ${transition.target} via event ${eventKey} not allowed by guard`,
                    );
                }
            }
        }

        const targetState = transition.target;

        // 2. Execute onExit actions for the current state
        if (stateDefinition.onExit) {
            for (const action of stateDefinition.onExit) {
                await action(context, eventKey);
            }
        }

        // 3. Execute actions for the transition itself
        if (transition.actions) {
            for (const action of transition.actions) {
                await action(context, eventKey);
            }
        }

        // 4. Update Status Log
        await this.addStatusLogEntry(
            context.eventEntity,
            targetState,
            context.actor,
            eventKey,
            context.payload?.reason,
            context.payload?.notes,
        );

        // 5. Update event status
        context.eventEntity.status = targetState;

        // 6. Persist the entity
        try {
            await this.agendaEventRepository.save(context.eventEntity);
            this.logger.log(`Event ${context.eventEntity.id} transitioned from ${currentState} to ${targetState} via ${eventKey}`);
        } catch (error) {
            this.logger.error(`Failed to save event ${context.eventEntity.id} after transition to ${targetState}`, error);
            // Revert status log entry if save fails? Or handle by ensuring transactionality higher up.
            // For now, rethrow to indicate persistence failure.
            throw error;
        }

        // 7. Execute onEntry actions for the target state, only if the state has changed
        if (currentState !== targetState) {
            const targetStateDefinition = this.stateConfig[targetState];
            if (targetStateDefinition?.onEntry) {
                for (const action of targetStateDefinition.onEntry) {
                    await action(context, eventKey); // Pass eventKey as the trigger for entry
                }
            }
        }

        return targetState;
    }

    /**
     * Retrieves the configuration for a given state.
     * Useful for debugging or for UI to understand possible actions.
     */
    getStateConfig(state: AgendaEventStatus): Readonly<typeof this.stateConfig[AgendaEventStatus]> {
        return this.stateConfig[state];
    }

    private async checkIfEventHasPhotos(eventEntity: AgendaEvent): Promise<boolean> {
        // Esta es una implementación de ejemplo que deberá adaptarse al modelo de datos real
        try {
            // Implementación temporal para evitar errores
            // Este método debe adaptarse según cómo se almacenan las fotos en tu sistema
            // Por ejemplo, consultando una tabla de evidencias de trabajo o un campo en el evento
            
            // Opción segura: verificar si el estado indica que ya debería tener fotos
            // o implementar una consulta a un repositorio que guarde esta información
            return [AgendaEventStatus.WAITING_FOR_REVIEW, AgendaEventStatus.REVIEWED, AgendaEventStatus.AFTERCARE_PERIOD].includes(eventEntity.status);
            
            // Implementación real sugerida (comentada):
            // const workEvidence = await this.workEvidenceRepository.findByEventId(eventEntity.id);
            // return workEvidence && workEvidence.photos && workEvidence.photos.length > 0;
        } catch (error) {
            this.logger.error(`Error checking photos for event ${eventEntity.id}`, error);
            return false;
        }
    }
} 