import { DomainException } from '../../../global/domain/exceptions/domain.exception';

export class InsufficientTokensError extends DomainException {
  constructor(
    public readonly currentBalance: number,
    public readonly requestedAmount: number,
    public readonly userId: string,
  ) {
    super(
      `Insufficient tokens. Current balance: ${currentBalance}, requested: ${requestedAmount}`,
      402, // Payment Required
    );
  }
}