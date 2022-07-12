import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AddressInterface } from '../../domain/interfaces/address.interface';
import { GeometryDto } from './geometry.dto';

export class AddressDto implements AddressInterface {
  @ApiProperty({
    example: 'Av vicuña mackenna',
    description: 'Calle',
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly address1: string;

  @ApiProperty({
    example: '6130',
    description: 'Numeracion',
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly address2: string;

  @ApiProperty({
    example: 'depto 1303',
    description: 'Numero dpto, block, etc...',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Expose()
  readonly address3?: string;

  @ApiProperty({
    example: 'La Florida',
    description: 'Comuna',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  readonly city?: string;

  @ApiProperty({
    example: 'Metropolitana',
    description: 'Region',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  readonly state?: string;

  @ApiProperty({
    example: 'Chile',
    description: 'Pais',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  readonly country?: string;

  @ApiProperty({
    example: 'Av Vicuña Mackenna 6130 Depto 1303',
    description: 'Direccion completa',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  readonly formattedAddress?: string;

  @ApiProperty({
    example: 'ChIJve_jt4TRYpYR_g66EFqd7GQ',
    description: 'Google Maps Place ID',
    required: false,
  })
  @IsString()
  @Expose()
  readonly googlePlaceId?: string;

  @ApiProperty({
    description: 'geometry',
    required: false,
    type: GeometryDto,
  })
  @ValidateNested()
  @Type(() => GeometryDto)
  @Expose()
  readonly geometry?: GeometryDto;
}
