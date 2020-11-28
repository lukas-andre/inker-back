import { Role } from './role.entity';
export declare class User {
    id: string;
    username: string;
    email: string;
    password: string;
    active: boolean;
    userType: string;
    role: Role;
    created_at: Date;
    updated_at: Date;
}
