import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ActivityTypeEnum } from './enums/activity.enum';
import { ReactionTypeEnum } from './enums/reaction.enum';

export class ReactionToActivityDto {
  @ApiProperty({
    description: 'Activity Reaction',
    enum: ReactionTypeEnum,
    example: ReactionTypeEnum.INK,
  })
  @IsEnum(ReactionTypeEnum)
  readonly reaction: ReactionTypeEnum;

  @ApiProperty({
    description: 'location',
    example: '1231234,123124',
  })
  @IsString()
  readonly location: string;

  @ApiProperty({
    description: 'Activity id',
    example: 12,
  })
  @IsNumber()
  readonly activityId: number;

  @ApiProperty({
    description: 'Activity id',
    example: ActivityTypeEnum.POST,
  })
  @IsEnum(ActivityTypeEnum)
  readonly activity: ActivityTypeEnum;
}
