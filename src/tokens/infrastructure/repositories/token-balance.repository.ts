import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TOKENS_DB_CONNECTION_NAME } from '../../../databases/constants';
import { TokenBalanceDto } from '../../domain/dtos/token-balance.dto';
import { ITokenBalanceRepository } from '../../domain/interfaces/token-repository.interface';
import { TokenBalance } from '../entities/token-balance.entity';

@Injectable()
export class TokenBalanceRepository implements ITokenBalanceRepository {
  constructor(
    @InjectRepository(TokenBalance, TOKENS_DB_CONNECTION_NAME)
    private readonly repository: Repository<TokenBalance>,
  ) {}

  async findByUserId(userId: string): Promise<TokenBalanceDto | null> {
    const balance = await this.repository.findOne({
      where: { userId },
    });
    return balance;
  }

  async create(balance: Partial<TokenBalanceDto>): Promise<TokenBalanceDto> {
    const entity = this.repository.create(balance);
    return await this.repository.save(entity);
  }

  async update(userId: string, balance: Partial<TokenBalanceDto>): Promise<TokenBalanceDto> {
    await this.repository.update({ userId }, balance);
    return await this.findByUserId(userId);
  }

  async incrementBalance(userId: string, amount: number): Promise<TokenBalanceDto> {
    const result = await this.repository
      .createQueryBuilder()
      .update(TokenBalance)
      .set({
        balance: () => `balance + ${amount}`,
        totalGranted: () => `total_granted + ${amount}`,
      })
      .where('user_id = :userId', { userId })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  async decrementBalance(userId: string, amount: number): Promise<TokenBalanceDto> {
    const result = await this.repository
      .createQueryBuilder()
      .update(TokenBalance)
      .set({
        balance: () => `balance - ${amount}`,
        totalConsumed: () => `total_consumed + ${amount}`,
      })
      .where('user_id = :userId AND balance >= :amount', { userId, amount })
      .returning('*')
      .execute();

    if (!result.affected || result.affected === 0) {
      return null;
    }

    return result.raw[0];
  }
}