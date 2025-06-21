import { Injectable, Logger } from '@nestjs/common';

// import { InjectQueue } from '@nestjs/bull'; // Removed
// import { Queue } from 'bull'; // Removed
// import { queues } from '../../../queues/queues'; // Removed
import { PenaltyAppliedEvent } from '../../../agenda/domain/events/penaltyApplied.event';

export interface IDomainEvent {
  readonly eventName?: string; // Made optional, constructor name can be fallback
  readonly occurredAt: Date;
  // Add any other common properties for domain events
}

@Injectable()
export class DomainEventsService {
  private readonly logger = new Logger(DomainEventsService.name);

  constructor() {} // @InjectQueue(queues.penaltyProcessing.name) private readonly penaltyProcessingQueue: Queue, // Removed

  async emitEvent(event: IDomainEvent) {
    const eventIdentifier = event.eventName || event.constructor.name;
    this.logger.log(
      `Domain Event Emitted: ${eventIdentifier}, Data: ${JSON.stringify(
        event,
      )}`,
    );

    if (event instanceof PenaltyAppliedEvent) {
      // This logic is now moved to CancelEventAndApplyPenaltyUseCase
      this.logger.warn(
        `PenaltyAppliedEvent received in DomainEventsService, but should be handled directly by use cases. Penalty ID: ${event.penalty.id}`,
      );
      // const jobPayload = {
      //   jobId: 'PROCESS_PENALTY_V1',
      //   penalty: event.penalty,
      // };
      // try {
      //   await this.penaltyProcessingQueue.add(jobPayload);
      //   this.logger.log(`PenaltyAppliedEvent dispatched to ${queues.penaltyProcessing.name} queue with job ID ${jobPayload.jobId}.`);
      // } catch (error) {
      //   this.logger.error(`Failed to dispatch PenaltyAppliedEvent to ${queues.penaltyProcessing.name} queue`, error);
      // }
    } else {
      this.logger.log(
        `Event ${eventIdentifier} not dispatched to a specific queue (no handler configured in DomainEventsService).`,
      );
    }
  }

  async emitEvents(events: IDomainEvent[]) {
    for (const event of events) {
      await this.emitEvent(event);
    }
  }
}
