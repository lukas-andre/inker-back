import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class MetaTagDto {
  @ApiProperty({
    description: 'tag name',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Transform(value => (value ? value : ''))
  @Expose()
  readonly id?: number;

  @ApiProperty({
    description: 'tag name',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Transform(value => (value ? value : ''))
  @Expose()
  readonly name?: string;
}
