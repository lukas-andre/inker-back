import { BaseEntity } from '../../../global/infrastructure/entities/base.entity';
export declare class Permission extends BaseEntity {
    controller: string;
    action: string;
    description: string;
}
