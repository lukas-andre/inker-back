import { Repository, FindOneOptions } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
export declare class RolesService {
    private readonly rolesRepository;
    constructor(rolesRepository: Repository<Role>);
    initRoles(permissions: Permission[]): Promise<Role[]>;
    findAll(query: any): Promise<Role[]>;
    findById(id: number): Promise<Role>;
    findOne(query: FindOneOptions<Role>): Promise<Role>;
}
