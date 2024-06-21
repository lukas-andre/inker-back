import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateQuotationReqDto {
  @ApiProperty({
    example: 'Please make me a tattoo',
    description: 'Quotation description, maybe should be created with IA',
  })
  @IsString()
  readonly title: string;

  @ApiProperty({
    example: 'I want a tattoo bla bla bla bla ba',
    description: 'Extra info',
  })
  @IsString()
  readonly description: string;

  @ApiProperty({
    example: 1,
    description: 'Customer Id',
  })
  @IsNumber()
  readonly customerId: number;

  @ApiProperty({
    example: 1,
    description: 'Artist Id',
  })
  @IsNumber()
  readonly artistId: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'proposed design',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  readonly files?: any[];
}
