import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

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
  id: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Interaction type', enum: InteractionTypeEnum })
  @IsEnum(InteractionTypeEnum)
  interactionType: string;

  @ApiProperty({ description: 'Entity type', enum: EntityTypeEnum })
  @IsEnum(EntityTypeEnum)
  entityType: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsString()
  entityId: string;

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
  @IsString()
  entityId: string;
}
