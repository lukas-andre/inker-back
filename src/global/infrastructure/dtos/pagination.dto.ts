import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class PaginationDto {
  @Expose()
  @ApiProperty({
    description: 'How many items per page',
    example: 50,
    default: 50,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Transform((value) => Number(value))
  readonly limit: number;

  @Expose()
  @ApiProperty({
    description: 'From which record you want to start to count',
    example: 1,
    default: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Transform((value) => Number(value))
  readonly offset: number;
}
