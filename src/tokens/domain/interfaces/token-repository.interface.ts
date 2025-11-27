import { TokenBalance } from '../../infrastructure/entities/token-balance.entity';
import { TokenTransaction } from '../../infrastructure/entities/token-transaction.entity';

export interface ITokenBalanceRepository {
  findByUserId(userId: string): Promise<TokenBalance | null>;
  create(balance: Partial<TokenBalance>): Promise<TokenBalance>;
  update(userId: string, balance: Partial<TokenBalance>): Promise<TokenBalance>;
  incrementBalance(userId: string, amount: number, isGrant?: boolean): Promise<TokenBalance>;
  decrementBalance(userId: string, amount: number): Promise<TokenBalance>;
}

export interface ITokenTransactionRepository {
  create(transaction: Partial<TokenTransaction>): Promise<TokenTransaction>;
  findById(id: string): Promise<TokenTransaction | null>;
  findByUserId(userId: string, limit?: number): Promise<TokenTransaction[]>;
  updateStatus(id: string, status: string): Promise<TokenTransaction>;
}