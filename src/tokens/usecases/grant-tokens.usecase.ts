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
import { TokenBalanceRepository } from '../infrastructure/repositories/token-balance.repository';
import { TokenTransactionRepository } from '../infrastructure/repositories/token-transaction.repository';

export interface GrantTokensParams {
  userId: string;
  userType: UserType;
  userTypeId: string;
  amount: number;
  reason: string;
  metadata?: {
    adminUserId?: string;
    promotionType?: string;
    promotionId?: string;
    registrationDate?: Date;
    grantedBy?: string;
    grantedVia?: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp?: Date;
  };
}

export interface GrantTokensResult {
  success: boolean;
  transaction: TokenTransactionDto;
  newBalance: number;
}

@Injectable()
export class GrantTokensUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly tokenBalanceRepository: TokenBalanceRepository,
    private readonly tokenTransactionRepository: TokenTransactionRepository,
    @Inject(TOKENS_DB_CONNECTION_NAME)
    private readonly dataSource: DataSource,
  ) {
    super(GrantTokensUseCase.name);
  }

  async execute(params: GrantTokensParams): Promise<GrantTokensResult> {
    const { userId, userType, userTypeId, amount, reason, metadata } = params;

    this.logger.log(`Granting ${amount} tokens to user ${userId}. Reason: ${reason}`);

    // Use a transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get or create balance
      let currentBalance = await this.tokenBalanceRepository.findByUserId(userId);
      
      if (!currentBalance) {
        // Create initial balance
        currentBalance = await this.tokenBalanceRepository.create({
          userId,
          userType,
          userTypeId,
          balance: 0,
          totalPurchased: 0,
          totalConsumed: 0,
          totalGranted: 0,
        });
        this.logger.log(`Created initial balance for user ${userId}`);
      }

      // Increment balance
      const updatedBalance = await this.tokenBalanceRepository.incrementBalance(userId, amount);

      // Create transaction record
      const transaction = await this.tokenTransactionRepository.create({
        userId,
        userType,
        userTypeId,
        type: metadata?.adminUserId ? TransactionType.MANUAL_ADJUSTMENT : TransactionType.GRANT,
        amount: amount, // Positive for grants
        balanceBefore: currentBalance.balance,
        balanceAfter: updatedBalance.balance,
        status: TransactionStatus.COMPLETED,
        metadata: {
          reason,
          ...metadata,
          grantedAt: new Date(),
        },
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      });

      await queryRunner.commitTransaction();

      this.logger.log(`Successfully granted ${amount} tokens to user ${userId}. New balance: ${updatedBalance.balance}`);

      // Log for audit purposes
      if (metadata?.adminUserId) {
        this.logger.info('Manual token grant', {
          action: 'MANUAL_GRANT',
          adminUserId: metadata.adminUserId,
          targetUserId: userId,
          targetUserTypeId: userTypeId,
          amount,
          reason,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
        });
      }

      return {
        success: true,
        transaction,
        newBalance: updatedBalance.balance,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      this.logger.error(`Failed to grant tokens to user ${userId}`, {
        error: error.message,
        stack: error.stack,
        userId,
        amount,
        reason,
      });
      
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}