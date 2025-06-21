import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEventNotesReqDto {
  @ApiProperty({
    description: 'Notes for the appointment',
    example: 'Customer requested black ink only. Sensitive to certain inks.',
  })
  @IsNotEmpty()
  @IsString()
  notes: string;
}
