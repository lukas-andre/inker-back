import { DefaultLoginUseCase } from '../usecases/defaultLogin.usecase';
import { LoginReqDto } from './dtos/loginReq.dto';
import { LoginResDto } from './dtos/loginRes.dto';
export declare class AuthHandler {
    private readonly loginUseCase;
    constructor(loginUseCase: DefaultLoginUseCase);
    handleLogin(dto: LoginReqDto): Promise<LoginResDto>;
}
