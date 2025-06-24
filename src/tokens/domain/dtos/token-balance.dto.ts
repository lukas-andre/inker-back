import { ApiProperty } from '@nestjs/swagger';
import { TokenBalance } from '../../infrastructure/entities/token-balance.entity';

export class TokenBalanceDto {
  @ApiProperty({ description: 'Current token balance' })
  balance: number;

  @ApiProperty({ description: 'Total tokens purchased' })
  totalPurchased: number;

  @ApiProperty({ description: 'Total tokens consumed' })
  totalConsumed: number;

  @ApiProperty({ description: 'Total tokens granted (promotions, bonuses)' })
  totalGranted: number;

  @ApiProperty({ description: 'Last purchase date', required: false })
  lastPurchaseAt?: Date;

  static fromEntity(entity: TokenBalance): TokenBalanceDto {
    const dto = new TokenBalanceDto();
    dto.balance = entity.balance;
    dto.totalPurchased = entity.totalPurchased;
    dto.totalConsumed = entity.totalConsumed;
    dto.totalGranted = entity.totalGranted;
    dto.lastPurchaseAt = entity.lastPurchaseAt;
    return dto;
  }
}