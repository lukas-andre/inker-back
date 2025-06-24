import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TOKENS_DB_CONNECTION_NAME } from '../../../databases/constants';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { ITokenTransactionRepository } from '../../domain/interfaces/token-repository.interface';
import { TokenTransaction } from '../entities/token-transaction.entity';

@Injectable()
export class TokenTransactionRepository implements ITokenTransactionRepository {
  constructor(
    @InjectRepository(TokenTransaction, TOKENS_DB_CONNECTION_NAME)
    private readonly repository: Repository<TokenTransaction>,
  ) {}

  get repo(): Repository<TokenTransaction> {
    return this.repository;
  }

  async create(transaction: Partial<TokenTransaction>): Promise<TokenTransaction> {
    const entity = this.repository.create(transaction);
    return await this.repository.save(entity);
  }

  async findById(id: string): Promise<TokenTransaction | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  async findByUserId(userId: string, limit: number = 50): Promise<TokenTransaction[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async updateStatus(id: string, status: string): Promise<TokenTransaction> {
    await this.repository.update({ id }, { status: status as TransactionStatus });
    return await this.findById(id);
  }
}