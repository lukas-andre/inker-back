import { TokenBalanceDto } from '../dtos/token-balance.dto';
import { TokenTransactionDto } from '../dtos/token-transaction.dto';

export interface ITokenBalanceRepository {
  findByUserId(userId: string): Promise<TokenBalanceDto | null>;
  create(balance: Partial<TokenBalanceDto>): Promise<TokenBalanceDto>;
  update(userId: string, balance: Partial<TokenBalanceDto>): Promise<TokenBalanceDto>;
  incrementBalance(userId: string, amount: number): Promise<TokenBalanceDto>;
  decrementBalance(userId: string, amount: number): Promise<TokenBalanceDto>;
}

export interface ITokenTransactionRepository {
  create(transaction: Partial<TokenTransactionDto>): Promise<TokenTransactionDto>;
  findById(id: string): Promise<TokenTransactionDto | null>;
  findByUserId(userId: string, limit?: number): Promise<TokenTransactionDto[]>;
  updateStatus(id: string, status: string): Promise<TokenTransactionDto>;
}