import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class GetQuotationsQueryDto {
  @ApiProperty({
    required: false,
    enum: ['pending', 'quoted', 'accepted', 'rejected', 'appealed', 'canceled'],
  })
  @IsOptional()
  //   @IsEnum(['pending', 'quoted', 'accepted', 'rejected', 'appealed', 'canceled'])
  status?:
    | 'pending'
    | 'quoted'
    | 'accepted'
    | 'rejected'
    | 'appealed'
    | 'canceled';

  @ApiProperty({ required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
