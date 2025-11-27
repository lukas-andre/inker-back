import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { GlobalModule } from '../global/global.module';
import { TokenRepositoryModule } from './infrastructure/repositories/tokenRepository.module';
import { TokensController } from './infrastructure/controllers/tokens.controller';
import { TokensAdminController } from './infrastructure/controllers/tokens-admin.controller';
import { ConsumeTokensUseCase } from './usecases/consume-tokens.usecase';
import { GetTokenBalanceUseCase } from './usecases/get-token-balance.usecase';
import { GrantTokensUseCase } from './usecases/grant-tokens.usecase';
import { GetTransactionHistoryUseCase } from './usecases/get-transaction-history.usecase';
import { PurchaseTokensUseCase } from './usecases/purchase-tokens.usecase';
import { IPaymentGateway } from './domain/interfaces/payment-gateway.interface';
import { MockPaymentGatewayService } from './infrastructure/services/mock-payment-gateway.service';
import { TokenPackageService } from './infrastructure/services/token-package.service';

@Module({
  imports: [
    GlobalModule,
    TokenRepositoryModule,
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  controllers: [TokensController, TokensAdminController],
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
    // Services
    TokenPackageService,
  ],
  exports: [
    GetTokenBalanceUseCase,
    ConsumeTokensUseCase,
    GrantTokensUseCase,
  ],
})
export class TokensModule {}