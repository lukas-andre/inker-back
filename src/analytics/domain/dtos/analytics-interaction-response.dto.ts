import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsInteractionResponseDto {
  @ApiProperty({ description: 'Indicates if the operation was successful' })
  result: boolean;

  @ApiProperty({ description: 'Current state of the interaction' })
  state: {
    count: number;
    userIds: number[];
  };

  @ApiProperty({ description: 'Additional metrics related to the interaction' })
  metrics: {
    viewCount: number;
    uniqueViewCount: number;
    engagementRate?: number;
  };
} 