import { Role } from './role.entity';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
export declare class User extends BaseEntity {
    username: string;
    email: string;
    password: string;
    active: boolean;
    userType: string;
    role: Role;
}
