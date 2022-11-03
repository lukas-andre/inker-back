import { Injectable } from '@nestjs/common';

import { LoginType } from '../domain/enums/loginType.enum';
import { DefaultLoginUseCase } from '../usecases/defaultLogin.usecase';
import { LoginParams } from '../usecases/interfaces/defaultLogin.params';

import { LoginReqDto } from './dtos/loginReq.dto';
import { LoginResDto } from './dtos/loginRes.dto';

@Injectable()
export class AuthHandler {
  constructor(private readonly loginUseCase: DefaultLoginUseCase) {}

  async handleLogin(dto: LoginReqDto): Promise<LoginResDto> {
    let result: LoginResDto;

    switch (dto.loginType) {
      case LoginType.FACEBOOK:
        break;
      case LoginType.GOOGLE:
        break;
      default:
        result = await this.loginUseCase.execute(dto as LoginParams);
        break;
    }

    return result;
  }
}
