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
    [QuotationStatus.PENDING]: [QuotationStatus.QUOTED, QuotationStatus.CANCELED, QuotationStatus.REJECTED],
    [QuotationStatus.QUOTED]: [QuotationStatus.ACCEPTED, QuotationStatus.REJECTED, QuotationStatus.APPEALED],
    [QuotationStatus.APPEALED]: [QuotationStatus.QUOTED, QuotationStatus.REJECTED],
    [QuotationStatus.ACCEPTED]: [],
    [QuotationStatus.REJECTED]: [],
    [QuotationStatus.CANCELED]: [],
    [QuotationStatus.OPEN]: [QuotationStatus.QUOTED, QuotationStatus.CANCELED, QuotationStatus.ACCEPTED],
  };

  getCurrentState(quotation: Quotation): QuotationStatus {
    return quotation.status;
  }

  transition(quotation: Quotation, newState: QuotationStatus): QuotationStatus {
    const currentState = this.getCurrentState(quotation);

    if (!(currentState in this.transitions)) {
        throw new StateMachineException(`Current state "${currentState}" is not defined in the state machine transitions.`);
    }

    const validTransitions = this.transitions[currentState];

    if (!validTransitions || !validTransitions.includes(newState)) {
      throw new StateMachineException(
        `Invalid state transition from ${currentState} to ${newState}`,
      );
    }

    return newState;
  }
}
