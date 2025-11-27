import { ApiProperty } from '@nestjs/swagger';

export class GetAgendaSettingsResDto {
  @ApiProperty({
    description: 'Working hours start time',
    example: '09:00',
  })
  workingHoursStart: string;

  @ApiProperty({
    description: 'Working hours end time',
    example: '18:00',
  })
  workingHoursEnd: string;

  @ApiProperty({
    description: 'Working days (1-7 where 1 is Monday)',
    example: ['1', '2', '3', '4', '5'],
    type: [String],
  })
  workingDays: string[];

  @ApiProperty({
    description: 'Whether the agenda is open for new appointments',
    example: true,
  })
  open: boolean;

  @ApiProperty({
    description: 'Whether the agenda is publicly visible to customers',
    example: false,
  })
  public: boolean;
}
