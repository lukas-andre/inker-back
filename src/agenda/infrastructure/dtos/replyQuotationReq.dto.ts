import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class ReplyQuotationReqDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  quotationId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  artistId: number;

  @ApiProperty({ example: 200 })
  @IsNumber()
  @IsNotEmpty()
  estimatedCost: number;

  @ApiProperty({ example: '2023-07-21T17:32:28Z' })
  @IsOptional()
  appointmentDate?: Date;

  @ApiProperty({ example: 2 })
  @IsOptional()
  appointmentDuration?: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'reference images',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  readonly files?: any[];
}
