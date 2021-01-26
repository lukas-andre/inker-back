import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ReactionTypeEnum } from './enums/reaction.enum';

export class ReactionToActivityResponseDto {
  @ApiProperty({
    description: 'Activity reaction count',
    example: 5,
  })
  @IsNumber()
  readonly reactions: number;

  @ApiProperty({
    description: 'Activity id',
    example: 12,
  })
  @IsString()
  readonly activityId: number;

  @ApiProperty({
    description: 'raectionType type',
    example: ReactionTypeEnum.INK,
  })
  @IsEnum(ReactionTypeEnum)
  readonly reactionType: ReactionTypeEnum;
}
