import { LoginDto } from '../dtos/login.dto';
import { LoginResponseDto } from '../dtos/loginResponse.dto';
import { AuthHandler } from '../handlers/auth.handler';
export declare class AuthController {
    private readonly authHandler;
    private readonly serviceName;
    private readonly logger;
    constructor(authHandler: AuthHandler);
    login(loginDto: LoginDto): Promise<LoginResponseDto>;
}
