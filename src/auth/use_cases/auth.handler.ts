import { LoginReqDto } from '../infrasctructure/dtos/loginReq.dto';
import { LoginResDto } from '../infrasctructure/dtos/loginRes.dto';

export interface AuthHandler {
  login(loginDto: LoginReqDto): Promise<LoginResDto>;
}

export const AUTH_HANDLER_DI_TOKEN = 'AUTH_HANDLER';
