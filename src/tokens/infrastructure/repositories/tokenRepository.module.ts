import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TOKENS_DB_CONNECTION_NAME } from '../../../databases/constants';
import { TokenBalance } from '../entities/token-balance.entity';
import { TokenTransaction } from '../entities/token-transaction.entity';
import { TokenBalanceRepository } from './token-balance.repository';
import { TokenTransactionRepository } from './token-transaction.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [TokenBalance, TokenTransaction],
      TOKENS_DB_CONNECTION_NAME,
    ),
  ],
  providers: [TokenBalanceRepository, TokenTransactionRepository],
  exports: [TokenBalanceRepository, TokenTransactionRepository],
})
export class TokenRepositoryModule {}