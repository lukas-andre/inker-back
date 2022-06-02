import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateUserUsernameReqDto {
  @ApiProperty({
    example: 'noname_eter',
    description: 'New Username',
    required: true,
  })
  @IsString()
  @Length(6, 20)
  @IsNotEmpty()
  readonly username: string;
}
