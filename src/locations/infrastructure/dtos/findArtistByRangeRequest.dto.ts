import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class FindArtistByRangeDTORequest {
  @ApiProperty({
    example: 0.5,
    description: 'Rango en kilometros',
  })
  @IsNotEmpty()
  @IsNumber()
  readonly range: number;

  @ApiProperty({
    example: -33.51215,
    description: 'Latitud',
  })
  @IsNotEmpty()
  @IsNumber()
  readonly lat: number;

  @ApiProperty({
    example: -70.60971,
    description: 'Longitud',
  })
  @IsNotEmpty()
  @IsNumber()
  readonly lng: number;
}
