import { JwtPermission } from '../interfaces/jwtPayload.interface';
export declare class LoginResponseDto {
    id: string;
    username?: string;
    email?: string;
    userType: string;
    permision: JwtPermission[];
    accessToken: string;
    expiresIn: string;
}
