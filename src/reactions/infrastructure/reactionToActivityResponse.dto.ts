import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ReactionTypeEnum } from './enums/reaction.enum';

export class ReactionToActivityResponseDto {
  @ApiProperty({
    description: 'Activity reaction count',
    example: 5,
  })
  @IsNumber()
  readonly totalReactions: number;

  @ApiProperty({
    description: 'Activity id',
    example: 12,
  })
  @IsString()
  readonly activityId: number;

  @ApiProperty({
    description: 'raection type',
    example: ReactionTypeEnum.INK,
  })
  @IsString()
  readonly activityType: string;

  @ApiProperty({
    description: 'raections in DESC order',
    example: [ReactionTypeEnum.INK, ReactionTypeEnum.LOVE],
  })
  @IsString()
  readonly reactions: string;
}
