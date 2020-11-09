import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
export declare class PermissionsService {
    private readonly permissionsRepository;
    constructor(permissionsRepository: Repository<Permission>);
    findAll(query: any): Promise<Permission[]>;
    findOne(query: any): Promise<Permission>;
}
