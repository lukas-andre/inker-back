import { IDomainEvent } from '../../../global/domain/events/domainEvents.service';
import { CancellationPenalty } from '../../infrastructure/entities/cancellationPenalty.entity';

export class PenaltyAppliedEvent implements IDomainEvent {
  readonly eventName = 'agenda.penalty.applied'; // Explicit event name
  readonly occurredAt: Date;

  constructor(public readonly penalty: CancellationPenalty) {
    this.occurredAt = new Date();
  }
}
