import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsNumber } from 'class-validator';

export class BaseDTO {
  @ApiProperty({
    description: 'Resource id',
    required: true,
    type: Number,
    example: 1,
  })
  @Expose()
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Resource created date',
    required: true,
    type: Date,
    example: new Date(),
  })
  @Expose()
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Resource updated date',
    required: true,
    type: Date,
    example: new Date(),
  })
  @Expose()
  @IsDate()
  updatedAt: Date;
}
