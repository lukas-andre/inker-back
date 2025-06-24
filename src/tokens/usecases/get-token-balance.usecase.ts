import { Injectable } from '@nestjs/common';

import {
  BaseUseCase,
  UseCase,
} from '../../global/domain/usecases/base.usecase';
import { UserType } from '../../users/domain/enums/userType.enum';
import { TokenBalanceDto } from '../domain/dtos/token-balance.dto';
import { TokenBalanceRepository } from '../infrastructure/repositories/token-balance.repository';

export interface GetTokenBalanceParams {
  userId: string;
  userType: UserType;
  userTypeId: string;
}

@Injectable()
export class GetTokenBalanceUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly tokenBalanceRepository: TokenBalanceRepository,
  ) {
    super(GetTokenBalanceUseCase.name);
  }

  async execute(params: GetTokenBalanceParams): Promise<TokenBalanceDto> {
    const { userId, userType, userTypeId } = params;

    this.logger.log(`Getting token balance for user ${userId}`);

    let balance = await this.tokenBalanceRepository.findByUserId(userId);

    if (!balance) {
      // Create initial balance if it doesn't exist
      balance = await this.tokenBalanceRepository.create({
        userId,
        userType,
        userTypeId,
        balance: 0,
        totalPurchased: 0,
        totalConsumed: 0,
        totalGranted: 0,
      });

      this.logger.log(`Created initial token balance for user ${userId}`);
    }

    return balance;
  }
}