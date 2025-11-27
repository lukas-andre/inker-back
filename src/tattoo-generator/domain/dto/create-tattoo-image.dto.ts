import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import {
  TattooStyle,
  TattooStyleDescriptions,
} from '../enums/tattooStyle.enum';

export class CreateTattooImageDto {
  @ApiProperty({
    description: 'Tattoo style to apply to the generated image',
    enum: TattooStyle,
    examples: {
      tradicionalAmericano: {
        value: TattooStyle.TRADITIONAL_AMERICAN,
        description: TattooStyleDescriptions[TattooStyle.TRADITIONAL_AMERICAN],
      },
      puntillismo: {
        value: TattooStyle.DOTWORK,
        description: TattooStyleDescriptions[TattooStyle.DOTWORK],
      },
      geometrico: {
        value: TattooStyle.GEOMETRIC,
        description: TattooStyleDescriptions[TattooStyle.GEOMETRIC],
      },
    },
  })
  @IsNotEmpty()
  @IsEnum(TattooStyle)
  style: TattooStyle;

  @ApiProperty({
    description: 'User input describing the desired tattoo',
    example: 'Quiero una mano de Fatima para tatuarme en el antebrazo',
  })
  @IsNotEmpty()
  @IsString()
  userInput: string;
}
