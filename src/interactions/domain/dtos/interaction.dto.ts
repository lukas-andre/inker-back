import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { InteractionType } from '../interactionType';

enum InteractionTypeEnum {
  VIEW = 'view',
  LIKE = 'like',
  SAVE = 'save',
  SHARE = 'share',
}

enum EntityTypeEnum {
  ARTIST = 'artist',
  WORK = 'work',
  STENCIL = 'stencil',
}

export class InteractionDto implements InteractionType {
  @ApiProperty({ description: 'Interaction ID' })
  id: number;

  @ApiProperty({ description: 'User ID' })
  @IsInt()
  @Min(1)
  userId: number;

  @ApiProperty({ description: 'Interaction type', enum: InteractionTypeEnum })
  @IsEnum(InteractionTypeEnum)
  interactionType: string;

  @ApiProperty({ description: 'Entity type', enum: EntityTypeEnum })
  @IsEnum(EntityTypeEnum)
  entityType: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsInt()
  @Min(1)
  entityId: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}

export class CreateInteractionDto {
  @ApiProperty({ description: 'Interaction type', enum: InteractionTypeEnum })
  @IsEnum(InteractionTypeEnum)
  @IsNotEmpty()
  interactionType: string;

  @ApiProperty({ description: 'Entity type', enum: EntityTypeEnum })
  @IsEnum(EntityTypeEnum)
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsInt()
  @Min(1)
  entityId: number;
}