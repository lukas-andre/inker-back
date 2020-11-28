import { IsString } from 'class-validator';

export class LoginParams {
  @IsString()
  readonly identifier: string;

  @IsString()
  readonly password: string;

  @IsString()  readonly loginType: string;
}
