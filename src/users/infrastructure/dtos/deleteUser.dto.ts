import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DeleteUserReqDto {
  @ApiProperty({
    example: '1qaz2wsx',
    description: 'Current password to confirm deletion',
    required: true,
  })
  @IsString()
  @MinLength(6)
  readonly password: string;
}