import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AddressInterface } from '../../domain/interfaces/address.interface';

export class AddressDto implements AddressInterface {
  @ApiProperty({
    example: 'Av vicuña mackenna',
    description: 'Calle',
  })
  @IsNotEmpty()
  @IsString()
  readonly address1: string;

  @ApiProperty({
    example: '6130',
    description: 'Numeracion',
  })
  @IsNotEmpty()
  @IsString()
  readonly address2: string;

  @ApiProperty({
    example: 'depto 1303',
    description: 'Numero dpto, block, etc...',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly address3?: string;

  @ApiProperty({
    example: 'La Florida',
    description: 'Comuna',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly city?: string;

  @ApiProperty({
    example: 'Metropolitana',
    description: 'Region',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly state?: string;

  @ApiProperty({
    example: 'Chile',
    description: 'Pais',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly country?: string;

  @ApiProperty({
    example: -33.0244,
    description: 'Latitud',
  })
  @IsNotEmpty()
  @IsNumber()
  readonly latitud: number;

  @ApiProperty({
    example: -71.5517,
    description: 'Longitud',
  })
  @IsNotEmpty()
  @IsNumber()
  readonly longitud: number;
}
