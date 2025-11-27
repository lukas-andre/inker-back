import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';
import { BetaSignupController } from './infrastructure/controllers/betaSignup.controller';
import { ProcessBetaSignupUseCase } from './usecases/processBetaSignup.usecase';

@Module({
  imports: [NotificationsModule],
  controllers: [BetaSignupController],
  providers: [ProcessBetaSignupUseCase],
})
export class BetaSignupModule {}