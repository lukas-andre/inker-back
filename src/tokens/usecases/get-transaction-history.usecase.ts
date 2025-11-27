import { Injectable } from '@nestjs/common';
import { BaseUseCase, UseCase } from '../../global/domain/usecases/base.usecase';
import { TokenTransaction } from '../infrastructure/entities/token-transaction.entity';
import { TokenTransactionRepository } from '../infrastructure/repositories/token-transaction.repository';
import { TransactionType } from '../domain/enums/transaction-type.enum';

export interface GetTransactionHistoryParams {
  userId: string;
  limit?: number;
  offset?: number;
  type?: string;
}

@Injectable()
export class GetTransactionHistoryUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly tokenTransactionRepository: TokenTransactionRepository,
  ) {
    super(GetTransactionHistoryUseCase.name);
  }

  async execute(params: GetTransactionHistoryParams): Promise<TokenTransaction[]> {
    const { userId, limit = 20, offset = 0, type } = params;

    this.logger.log(`Getting transaction history for user ${userId}`);

    const queryBuilder = this.tokenTransactionRepository.repo
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .orderBy('transaction.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    if (type && Object.values(TransactionType).includes(type as TransactionType)) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    const transactions = await queryBuilder.getMany();

    this.logger.log(`Found ${transactions.length} transactions for user ${userId}`);

    return transactions;
  }
}