import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Match } from '../../../global/domain/validators/match.validator';

export class UpdateUserPasswordReqDto {
  @ApiProperty({
    example: '1qaz2wsx',
    description: 'New Password',
    required: true,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  readonly password: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Match('password')
  readonly repeatedPassword: string;
}
