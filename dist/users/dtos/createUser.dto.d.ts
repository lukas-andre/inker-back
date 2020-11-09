import { UserType } from '../enums/userType.enum';
export declare class CreateUserDto {
    readonly username: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly password: string;
    readonly userType: UserType;
    readonly phoneNumber?: string;
}
