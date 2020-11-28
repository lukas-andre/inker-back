import { PermissionsService } from '../../domain/services/permissions.service';
import { RolesService } from '../../domain/services/roles.service';
export declare class InitRolesUseCase {
    private readonly rolesService;
    private readonly permissionsService;
    constructor(rolesService: RolesService, permissionsService: PermissionsService);
    execute(): Promise<import("../../infrastructure/entities/role.entity").Role[]>;
}
