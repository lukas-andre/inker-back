import { ApiProperty } from '@nestjs/swagger';

export class TokenMetricsOverviewDto {
  @ApiProperty({ description: 'Total number of users with token balances' })
  totalUsers: number;

  @ApiProperty({ description: 'Total tokens currently in circulation' })
  totalTokensInCirculation: number;

  @ApiProperty({ description: 'Total tokens consumed all time' })
  totalTokensConsumed: number;

  @ApiProperty({ description: 'Total tokens granted all time' })
  totalTokensGranted: number;

  @ApiProperty({ description: 'Total tokens purchased all time' })
  totalTokensPurchased: number;

  @ApiProperty({ description: 'Average token balance per user' })
  averageBalance: number;
}

export class TokenActivityDto {
  @ApiProperty({ description: 'Transaction type' })
  type: string;

  @ApiProperty({ description: 'Number of transactions' })
  count: number;

  @ApiProperty({ description: 'Total amount of tokens' })
  totalAmount: number;
}

export class LowBalanceUserDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User type' })
  userType: string;

  @ApiProperty({ description: 'Current balance' })
  balance: number;
}

export class TokenMetricsDto {
  @ApiProperty({ description: 'Overview metrics', type: TokenMetricsOverviewDto })
  overview: TokenMetricsOverviewDto;

  @ApiProperty({ description: 'Recent activity by type', type: [TokenActivityDto] })
  recentActivity: TokenActivityDto[];

  @ApiProperty({ description: 'Users with low balance', type: [LowBalanceUserDto] })
  lowBalanceUsers: LowBalanceUserDto[];

  @ApiProperty({ description: 'Timestamp of metrics generation' })
  timestamp: Date;
}

export class DailyTokenStatsDto {
  @ApiProperty({ description: 'Date' })
  date: string;

  @ApiProperty({ description: 'Tokens consumed' })
  consumed: number;

  @ApiProperty({ description: 'Tokens purchased' })
  purchased: number;

  @ApiProperty({ description: 'Tokens granted' })
  granted: number;

  @ApiProperty({ description: 'Active users' })
  activeUsers: number;
}