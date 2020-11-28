import { ServiceError } from '../../../global/domain/interfaces/serviceError';
import { FindAllPermissionsUseCase } from '../../usecases/permission/findAllPermissions.usecase';
import { FindAllRoutesUseCase } from '../../usecases/permission/findAllRoutes.usecase';
import { FindOnePermissionUseCase } from '../../usecases/permission/findOnePermission.usecase';
import { InitPermissionsUseCase } from '../../usecases/permission/initPermissions.usecase';
import { Permission } from '../entities/permission.entity';
export declare class PermissionsHandler {
    private readonly initPermissionsUseCase;
    private readonly findAllRoutesUseCase;
    private readonly findOnePermissionUseCase;
    private readonly findAllPermissionsUseCase;
    constructor(initPermissionsUseCase: InitPermissionsUseCase, findAllRoutesUseCase: FindAllRoutesUseCase, findOnePermissionUseCase: FindOnePermissionUseCase, findAllPermissionsUseCase: FindAllPermissionsUseCase);
    handleInitial(): Promise<Permission[]>;
    findRoutes(): Promise<Permission[] | ServiceError>;
    findOne(id: string): Promise<Permission>;
    findAll(query: any): Promise<Permission[]>;
}
