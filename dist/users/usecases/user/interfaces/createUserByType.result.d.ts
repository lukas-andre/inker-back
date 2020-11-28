import { UserType } from '../../../domain/enums/userType.enum';
export declare class CreateUserByTypeResult {
    readonly username: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly userType: UserType;
    readonly phoneNumber?: string;
}
