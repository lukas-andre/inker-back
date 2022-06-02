import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum DefaultResponseStatus {
  OK = 'ok',
  FAILURE = 'failure',
  UNKNOWN = 'unknown',
}

export class DefaultResponseDto {
  @ApiProperty({
    description: 'response generic status',
    enum: DefaultResponseStatus,
    example: DefaultResponseStatus.OK,
  })
  @IsEnum(DefaultResponseStatus)
  status: DefaultResponseStatus;

  @ApiProperty({
    description:
      'any response data -> Record<string, any> | string | boolean | number',
    example: true,
    type: Object,
    required: false,
  })
  @IsString()
  @IsOptional()
  data?: Record<string, any> | string | boolean | number;
}
