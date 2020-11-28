import { RolesService } from '../../domain/services/roles.service';
export declare class FindAllRolesUseCase {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    execute(query: any): Promise<import("../../infrastructure/entities/role.entity").Role[]>;
}
