import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CancelEventReqDto {
  @ApiProperty({
    description: 'Reason for cancelling the event',
    example: 'Unable to attend due to a prior commitment.',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;
}
