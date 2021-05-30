import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class MetatagDto {
  @ApiProperty({
    description: 'tag name',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Transform((value) => (value ? value : ''))
  readonly id?: number;

  @ApiProperty({
    description: 'tag name',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Transform((value) => (value ? value : ''))
  readonly name?: string;
}
