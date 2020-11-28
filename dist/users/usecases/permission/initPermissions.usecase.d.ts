import { InitialPermissionsService } from '../../domain/services/initialPermissions.service';
export declare class InitPermissionsUseCase {
    private readonly permissionsService;
    constructor(permissionsService: InitialPermissionsService);
    execute(): Promise<import("../../../global/domain/interfaces/serviceError").ServiceError | import("../../infrastructure/entities/permission.entity").Permission[]>;
}
