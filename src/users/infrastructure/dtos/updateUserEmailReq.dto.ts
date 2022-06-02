import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserEmailReqDto {
  @ApiProperty({
    example: 'lucas.henry@inker.cloud',
    description: 'New User Email',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
