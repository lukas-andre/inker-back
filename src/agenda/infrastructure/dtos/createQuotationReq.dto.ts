import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { QuotationType } from '../entities/quotation.entity';
import { MoneyDto } from '../../../global/domain/dtos/money.dto';

export class CreateQuotationReqDto {
  @ApiProperty({
    description: 'Type of quotation',
    enum: QuotationType,
    default: QuotationType.DIRECT,
  })
  @IsEnum(QuotationType)
  @IsOptional()
  readonly type?: QuotationType = QuotationType.DIRECT;

  @ApiPropertyOptional({
    example: 'clrk1234567890abcd',
    description: 'Artist Id (Required if type is DIRECT, null/omitted if OPEN)',
  })
  @ValidateIf(o => o.type === QuotationType.DIRECT)
  @IsNotEmpty({ message: 'artistId is required for DIRECT quotations' })
  @IsString()
  readonly artistId?: string;

  @ApiProperty({
    example: 'I want a tattoo of a dragon on my left arm, about 15cm.',
    description: 'Detailed description of the tattoo request',
  })
  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @ApiPropertyOptional({
    example: 'clsk9876543210fedc',
    description: 'Stencil Id (optional) - Reference to a specific stencil design',
  })
  @IsString()
  @IsOptional()
  readonly stencilId?: string;

  @ApiPropertyOptional({
    example: 'cluv123abc...',
    description: 'Tattoo Design Cache ID (optional) - Reference to a specific AI-generated design. Required if tattooDesignImageUrl is provided. Only valid for OPEN type quotations. Cannot be used with stencilId.',
  })
  @IsString()
  @IsOptional()
  readonly tattooDesignCacheId?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.png',
    description: 'Specific Image URL from the Tattoo Design Cache (optional) - Required if tattooDesignCacheId is provided. Only valid for OPEN type quotations.',
  })
  @ValidateIf(o => o.type === QuotationType.OPEN && (o.tattooDesignCacheId || o.tattooDesignImageUrl))
  @IsNotEmpty({ message: 'tattooDesignImageUrl is required if tattooDesignCacheId is provided' })
  @IsString()
  @IsOptional()
  readonly tattooDesignImageUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'Reference images uploaded by the customer',
  })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  readonly files?: any[];

  @ApiPropertyOptional({
    description: 'Customer latitude (Required for OPEN quotations)',
    example: -33.45694,
  })
  @ValidateIf(o => o.type === QuotationType.OPEN)
  @IsNotEmpty({ message: 'customerLat is required for OPEN quotations' })
  @IsLatitude()
  readonly customerLat?: number;

  @ApiPropertyOptional({
    description: 'Customer longitude (Required for OPEN quotations)',
    example: -70.64827,
  })
  @ValidateIf(o => o.type === QuotationType.OPEN)
  @IsNotEmpty({ message: 'customerLon is required for OPEN quotations' })
  @IsLongitude()
  readonly customerLon?: number;

  @ApiPropertyOptional({
    description: 'Max distance customer is willing to travel in KM (Required for OPEN quotations)',
    example: 50,
  })
  @ValidateIf(o => o.type === QuotationType.OPEN)
  @IsNotEmpty({
    message: 'customerTravelRadiusKm is required for OPEN quotations',
  })
  @IsNumber()
  @Min(1)
  @Max(1000)
  readonly customerTravelRadiusKm?: number;

  @ApiPropertyOptional({ type: MoneyDto, description: 'Presupuesto mínimo sugerido (solo OPEN)' })
  @IsOptional()
  @ValidateIf(o => o.type === QuotationType.OPEN)
  @ValidateNested()
  @Type(() => MoneyDto)
  readonly minBudget?: MoneyDto;

  @ApiPropertyOptional({ type: MoneyDto, description: 'Presupuesto máximo sugerido (solo OPEN)' })
  @IsOptional()
  @ValidateIf(o => o.type === QuotationType.OPEN)
  @ValidateNested()
  @Type(() => MoneyDto)
  readonly maxBudget?: MoneyDto;

  @ApiPropertyOptional({ type: MoneyDto, description: 'Presupuesto de referencia (solo OPEN)' })
  @IsOptional()
  @ValidateIf(o => o.type === QuotationType.OPEN)
  @ValidateNested()
  @Type(() => MoneyDto)
  readonly referenceBudget?: MoneyDto;

  @ApiPropertyOptional({ description: 'ID de la imagen generada (solo OPEN)' })
  @IsOptional()
  @ValidateIf(o => o.type === QuotationType.OPEN)
  @IsString()
  readonly generatedImageId?: string;
}
