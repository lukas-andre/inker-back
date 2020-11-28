import { RolesService } from '../../domain/services/roles.service';
export declare class FindOneRoleUseCase {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    execute(id: number): Promise<import("../../infrastructure/entities/role.entity").Role>;
}
