import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class AutoCompleteQueryDto {
  @ApiProperty({
    description: 'The text string on which to search',
    example: 'Las Condes',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  input: string;

  @ApiProperty({
    description: 'Session token for billing purposes',
    required: false,
  })
  @IsString()
  @IsOptional()
  sessionToken?: string;
}

export class PredictionResponseDto {
  @ApiProperty({
    description: 'Unique place identifier',
    example: 'ChIJH_ximfDPYpYR_pGBUbiPJiw',
  })
  placeId: string;

  @ApiProperty({
    description: 'Human-readable name for the returned result',
    example: 'Las Condes, Santiago, Chile',
  })
  description: string;

  @ApiProperty({
    description: 'Formatted text for display',
    required: false,
  })
  structuredFormatting?: {
    mainText: string;
    secondaryText: string;
  };
}

export class AutoCompleteResponseDto {
  @ApiProperty({
    description: 'Array of predictions',
    type: [PredictionResponseDto],
  })
  predictions: PredictionResponseDto[];

  @ApiProperty({
    description: 'API response status',
    example: 'OK',
  })
  status: string;
}
