import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

import { TOKENS_DB_CONNECTION_NAME } from '../../databases/constants';
import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { UserType } from '../../users/domain/enums/userType.enum';
import { TokenTransactionDto } from '../domain/dtos/token-transaction.dto';
import { LOW_TOKEN_BALANCE } from '../../queues/notifications/domain/schemas/tokens';
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
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {
    super(ConsumeTokensUseCase.name);
  }

  async execute(params: ConsumeTokensParams): Promise<ConsumeTokensResult> {
    const { userId, userType, userTypeId, amount, metadata } = params;

    this.logger.log(`Attempting to consume ${amount} tokens for user ${userId}`);

    // Use a transaction to ensure atomicity
    const queryRunner = this.tokenBalanceRepository.repo.manager.connection.createQueryRunner();
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

      // Check if balance is low (threshold: 5 tokens)
      const LOW_TOKEN_THRESHOLD = 5;
      if (updatedBalance.balance <= LOW_TOKEN_THRESHOLD && updatedBalance.balance > 0) {
        this.logger.log(`User ${userId} has low token balance: ${updatedBalance.balance}`);

        // Queue notification job
        await this.notificationQueue.add({
          jobId: LOW_TOKEN_BALANCE,
          userId,
          userTypeId,
          metadata: {
            currentBalance: updatedBalance.balance,
            threshold: LOW_TOKEN_THRESHOLD,
            lastConsumedAt: new Date(),
          },
        }).catch(error => {
          // Don't fail the transaction if notification fails
          this.logger.error(`Failed to queue low balance notification for user ${userId}`, error);
        });
      }

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