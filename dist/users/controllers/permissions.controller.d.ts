import { HttpException } from '@nestjs/common';
import { Permission } from '../entities/permission.entity';
import { PermissionsHandler } from '../handlers/permissions.handler';
export declare class PermissionsController {
    private readonly permissionsHandler;
    constructor(permissionsHandler: PermissionsHandler);
    findAll(query: any): Promise<Permission[]>;
    initial(): Promise<Permission[] | HttpException>;
    findRoutes(): Promise<any>;
    findOne(id: number): Promise<Permission>;
}
