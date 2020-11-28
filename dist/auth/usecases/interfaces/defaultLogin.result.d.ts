import { JwtPermission } from '../../domain/interfaces/jwtPayload.interface';
export declare class DefaultLoginResult {
    id: string;
    username?: string;
    email?: string;
    userTypeId?: string;
    userType: string;
    permision: JwtPermission[];
    accessToken: string;
    expiresIn: number;
}
