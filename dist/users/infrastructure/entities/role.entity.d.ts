import { Permission } from './permission.entity';
import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
export declare class Role extends BaseEntity {
    name: string;
    description: string;
    permissions: Permission[];
}
