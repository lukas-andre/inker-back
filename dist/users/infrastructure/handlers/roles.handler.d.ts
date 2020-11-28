import { FindOneRoleUseCase } from '../../usecases/role/findOneRole.usecase';
import { FindAllRolesUseCase } from '../../usecases/role/findAllRoles.usecase';
import { InitRolesUseCase } from '../../usecases/role/initRoles.usecase';
export declare class RolesHandler {
    private readonly initRolesUseCase;
    private readonly findOneRoleUseCase;
    private readonly findAllRolesUseCase;
    constructor(initRolesUseCase: InitRolesUseCase, findOneRoleUseCase: FindOneRoleUseCase, findAllRolesUseCase: FindAllRolesUseCase);
    initRoles(): Promise<import("../entities/role.entity").Role[]>;
    findOne(id: number): Promise<import("../entities/role.entity").Role>;
    findAll(query: any): Promise<import("../entities/role.entity").Role[]>;
}
