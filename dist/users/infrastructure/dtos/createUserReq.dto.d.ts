import { UserType } from '../../domain/enums/userType.enum';
export declare class CreateUserReqDto {
    readonly username: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly password: string;
    readonly userType: UserType;
    readonly phoneNumber?: string;
}
