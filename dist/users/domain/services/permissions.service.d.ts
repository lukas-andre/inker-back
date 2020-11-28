import { FindOneOptions, Repository } from 'typeorm';
import { Permission } from '../../infrastructure/entities/permission.entity';
export declare class PermissionsService {
    private readonly permissionsRepository;
    constructor(permissionsRepository: Repository<Permission>);
    findAll(query: any): Promise<Permission[]>;
    findOne(options?: FindOneOptions<Permission>): Promise<Permission>;
}
