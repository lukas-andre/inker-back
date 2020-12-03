import { JwtPermission } from '../../../global/domain/interfaces/jwtPayload.interface';
export declare class DefaultLoginResult {
    id: number;
    username?: string;
    email?: string;
    userTypeId?: number;
    userType: string;
    permision: JwtPermission[];
    accessToken: string;
    expiresIn: number;
}
