import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateTemplateStatusDto {
  @ApiProperty({
    description: 'Active status of the template',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
