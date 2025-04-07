import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAgendaSettingsReqDto {
  @ApiProperty({
    description: 'Whether the agenda is open for new appointments',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  open?: boolean;

  @ApiProperty({
    description: 'Whether the agenda is publicly visible to customers',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  public?: boolean;
}