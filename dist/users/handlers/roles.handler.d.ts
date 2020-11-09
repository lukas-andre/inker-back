import { ConfigService } from '@nestjs/config';
import { PermissionsService } from '../services/permissions.service';
import { RolesService } from '../services/roles.service';
export declare class RolesHandler {
    private readonly rolesService;
    private readonly permissionsService;
    private readonly configService;
    constructor(rolesService: RolesService, permissionsService: PermissionsService, configService: ConfigService);
    initRoles(): Promise<import("../entities/role.entity").Role[]>;
    findOne(id: number): Promise<import("../entities/role.entity").Role>;
    findAll(query: any): Promise<import("../entities/role.entity").Role[]>;
}
