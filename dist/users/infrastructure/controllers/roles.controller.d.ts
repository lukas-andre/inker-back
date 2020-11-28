import { Role } from '../entities/role.entity';
import { RolesHandler } from '../handlers/roles.handler';
export declare class RolesController {
    private readonly rolesHandler;
    constructor(rolesHandler: RolesHandler);
    initRoles(): Promise<Role[]>;
    findAll(query: any): Promise<Role[]>;
    findOne(id: number): Promise<Role>;
}
