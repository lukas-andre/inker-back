import { LoginReqDto } from './dtos/loginReq.dto';
import { LoginResDto } from './dtos/loginRes.dto';
import { AuthHandler } from './auth.handler';
export declare class AuthController {
    private readonly authHandler;
    private readonly serviceName;
    private readonly logger;
    constructor(authHandler: AuthHandler);
    login(loginReqDto: LoginReqDto): Promise<LoginResDto>;
}
