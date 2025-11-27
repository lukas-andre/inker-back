import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsOptional, Min } from 'class-validator';

export class UpdateTokenPackageDto {
  @ApiProperty({ 
    description: 'Package name',
    example: 'Paquete Premium',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ 
    description: 'Number of tokens in the package',
    example: 100,
    minimum: 1,
    required: false
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  tokens?: number;

  @ApiProperty({ 
    description: 'Price of the package',
    example: 29.99,
    minimum: 0.01,
    required: false
  })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  price?: number;

  @ApiProperty({ 
    description: 'Package description',
    example: 'El mejor valor para usuarios frecuentes',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Badge text to display',
    example: 'MEJOR VALOR',
    required: false
  })
  @IsString()
  @IsOptional()
  badge?: string;

  @ApiProperty({ 
    description: 'Whether the package is active',
    example: true,
    required: false
  })
  @IsOptional()
  isActive?: boolean;
}