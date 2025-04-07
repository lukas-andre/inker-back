import { Injectable } from '@nestjs/common';

import { StateMachineException } from '../../global/domain/exceptions/statemachine.exception';
import { StateMachine } from '../../global/domain/interfaces/statemachine.interface';
import {
  Quotation,
  QuotationStatus,
} from '../infrastructure/entities/quotation.entity';

@Injectable()
export class QuotationStateMachine
  implements StateMachine<Quotation, QuotationStatus>
{
  private readonly transitions: Record<QuotationStatus, QuotationStatus[]> = {
    pending: ['quoted', 'canceled', 'rejected'],
    quoted: ['accepted', 'rejected', 'appealed'],
    appealed: ['quoted', 'rejected'],
    accepted: [],
    rejected: [],
    canceled: [],
  };

  getCurrentState(quotation: Quotation): QuotationStatus {
    return quotation.status;
  }

  transition(quotation: Quotation, newState: QuotationStatus): QuotationStatus {
    const currentState = this.getCurrentState(quotation);
    const validTransitions = this.transitions[currentState];

    if (!validTransitions.includes(newState)) {
      throw new StateMachineException(
        `Invalid state transition from ${currentState} to ${newState}`,
      );
    }

    return newState;
  }
}
