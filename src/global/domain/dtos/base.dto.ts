import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class BaseDTO {
  @ApiProperty({
    description: 'Resource id',
    required: true,
    type: String,
    example: '1',
  })
  @Expose()
  @IsString()
  id: string;

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
