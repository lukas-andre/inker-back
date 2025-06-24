import { Module } from '@nestjs/common';

import { GlobalModule } from '../global/global.module';
import { TokenRepositoryModule } from './infrastructure/repositories/tokenRepository.module';
import { TokensController } from './infrastructure/controllers/tokens.controller';
import { ConsumeTokensUseCase } from './usecases/consume-tokens.usecase';
import { GetTokenBalanceUseCase } from './usecases/get-token-balance.usecase';
import { GrantTokensUseCase } from './usecases/grant-tokens.usecase';
import { GetTransactionHistoryUseCase } from './usecases/get-transaction-history.usecase';
import { PurchaseTokensUseCase } from './usecases/purchase-tokens.usecase';
import { IPaymentGateway } from './domain/interfaces/payment-gateway.interface';
import { MockPaymentGatewayService } from './infrastructure/services/mock-payment-gateway.service';

@Module({
  imports: [
    GlobalModule,
    TokenRepositoryModule,
  ],
  controllers: [TokensController],
  providers: [
    // Use Cases
    GetTokenBalanceUseCase,
    ConsumeTokensUseCase,
    GrantTokensUseCase,
    GetTransactionHistoryUseCase,
    PurchaseTokensUseCase,
    // Payment Gateway - Use mock for now
    {
      provide: IPaymentGateway,
      useClass: MockPaymentGatewayService,
    },
  ],
  exports: [
    GetTokenBalanceUseCase,
    ConsumeTokensUseCase,
    GrantTokensUseCase,
  ],
})
export class TokensModule {}