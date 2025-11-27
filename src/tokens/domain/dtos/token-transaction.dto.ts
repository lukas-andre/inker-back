import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { TokenTransaction } from '../../infrastructure/entities/token-transaction.entity';

export class TokenTransactionDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'Transaction type', enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ description: 'Amount (positive for income, negative for expense)' })
  amount: number;

  @ApiProperty({ description: 'Balance before transaction' })
  balanceBefore: number;

  @ApiProperty({ description: 'Balance after transaction' })
  balanceAfter: number;

  @ApiProperty({ description: 'Transaction status', enum: TransactionStatus })
  status: TransactionStatus;

  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Transaction creation date' })
  createdAt: Date;

  static fromEntity(entity: TokenTransaction): TokenTransactionDto {
    const dto = new TokenTransactionDto();
    dto.id = entity.id;
    dto.type = entity.type;
    dto.amount = entity.amount;
    dto.balanceBefore = entity.balanceBefore;
    dto.balanceAfter = entity.balanceAfter;
    dto.status = entity.status;
    dto.metadata = entity.metadata;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}