import { HttpException } from '@nestjs/common';

export class InsufficientTokensError extends HttpException {
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