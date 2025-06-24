import { Module } from '@nestjs/common';

import { GlobalModule } from '../global/global.module';
import { TokenRepositoryModule } from './infrastructure/repositories/tokenRepository.module';
import { ConsumeTokensUseCase } from './usecases/consume-tokens.usecase';
import { GetTokenBalanceUseCase } from './usecases/get-token-balance.usecase';
import { GrantTokensUseCase } from './usecases/grant-tokens.usecase';

@Module({
  imports: [
    GlobalModule,
    TokenRepositoryModule,
  ],
  providers: [
    GetTokenBalanceUseCase,
    ConsumeTokensUseCase,
    GrantTokensUseCase,
  ],
  exports: [
    GetTokenBalanceUseCase,
    ConsumeTokensUseCase,
    GrantTokensUseCase,
  ],
})
export class TokensModule {}