import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { TOKENS_DB_CONNECTION_NAME } from '../../databases/constants';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { UserType } from '../../users/domain/enums/userType.enum';
import { TokenTransactionDto } from '../domain/dtos/token-transaction.dto';
import { TransactionStatus } from '../domain/enums/transaction-status.enum';
import { TransactionType } from '../domain/enums/transaction-type.enum';
import { InsufficientTokensError } from '../domain/errors/insufficient-tokens.error';
import { TokenBalanceRepository } from '../infrastructure/repositories/token-balance.repository';
import { TokenTransactionRepository } from '../infrastructure/repositories/token-transaction.repository';

export interface ConsumeTokensParams {
  userId: string;
  userType: UserType;
  userTypeId: string;
  amount: number;
  metadata?: {
    tattooGenerationId?: string;
    imageUrl?: string;
    prompt?: string;
    runwareCost?: number;
  };
}

export interface ConsumeTokensResult {
  success: boolean;
  transaction: TokenTransactionDto;
  newBalance: number;
}

@Injectable()
export class ConsumeTokensUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly tokenBalanceRepository: TokenBalanceRepository,
    private readonly tokenTransactionRepository: TokenTransactionRepository,
    @Inject(TOKENS_DB_CONNECTION_NAME)
    private readonly dataSource: DataSource,
  ) {
    super(ConsumeTokensUseCase.name);
  }

  async execute(params: ConsumeTokensParams): Promise<ConsumeTokensResult> {
    const { userId, userType, userTypeId, amount, metadata } = params;

    this.logger.log(`Attempting to consume ${amount} tokens for user ${userId}`);

    // Use a transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get current balance
      const currentBalance = await this.tokenBalanceRepository.findByUserId(userId);
      
      if (!currentBalance || currentBalance.balance < amount) {
        throw new InsufficientTokensError(
          currentBalance?.balance || 0,
          amount,
          userId,
        );
      }

      // Decrement balance
      const updatedBalance = await this.tokenBalanceRepository.decrementBalance(userId, amount);
      
      if (!updatedBalance) {
        throw new InsufficientTokensError(
          currentBalance.balance,
          amount,
          userId,
        );
      }

      // Create transaction record
      const transaction = await this.tokenTransactionRepository.create({
        userId,
        userType,
        userTypeId,
        type: TransactionType.CONSUME,
        amount: -amount, // Negative for consumption
        balanceBefore: currentBalance.balance,
        balanceAfter: updatedBalance.balance,
        status: TransactionStatus.COMPLETED,
        metadata: metadata || {},
      });

      await queryRunner.commitTransaction();

      this.logger.log(`Successfully consumed ${amount} tokens for user ${userId}. New balance: ${updatedBalance.balance}`);

      return {
        success: true,
        transaction,
        newBalance: updatedBalance.balance,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      this.logger.error(`Failed to consume tokens for user ${userId}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        amount,
      });
      
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}