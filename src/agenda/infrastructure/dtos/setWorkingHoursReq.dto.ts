import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SetWorkingHoursReqDto {
  @ApiProperty({
    description: 'Working hours start time in HH:MM format',
    example: '09:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Working hours start must be in format HH:MM',
  })
  workingHoursStart: string;

  @ApiProperty({
    description: 'Working hours end time in HH:MM format',
    example: '18:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Working hours end must be in format HH:MM',
  })
  workingHoursEnd: string;

  @ApiProperty({
    description: 'Working days of the week (1 = Monday, 7 = Sunday)',
    example: ['1', '2', '3', '4', '5'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  workingDays: string[];
}
