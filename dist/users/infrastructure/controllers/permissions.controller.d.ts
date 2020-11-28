import { Permission } from '../entities/permission.entity';
import { PermissionsHandler } from '../handlers/permissions.handler';
export declare class PermissionsController {
    private readonly permissionsHandler;
    constructor(permissionsHandler: PermissionsHandler);
    findAll(query: any): Promise<Permission[]>;
    initial(): Promise<Permission[]>;
    findRoutes(): Promise<any>;
    findOne(id: string): Promise<Permission>;
}
