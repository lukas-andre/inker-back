import { Permission } from './permission.entity';
export declare class Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    created_at: Date;
    updated_at: Date;
}
