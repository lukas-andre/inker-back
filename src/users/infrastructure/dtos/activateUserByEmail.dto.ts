import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ActivateUserByEmailReqDto {
  @ApiProperty({
    description: 'The email address of the user to activate',
    example: 'usuario@test.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
