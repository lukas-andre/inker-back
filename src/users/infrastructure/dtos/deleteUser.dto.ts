import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteUserReqDto {
  @ApiProperty({
    description: 'User password for confirmation',
    example: 'mySecurePassword123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
