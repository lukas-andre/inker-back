import { InitialPermissionsService } from '../../domain/services/initialPermissions.service';
export declare class FindAllRoutesUseCase {
    private readonly permissionsService;
    constructor(permissionsService: InitialPermissionsService);
    execute(): Promise<import("../../../global/domain/interfaces/serviceError").ServiceError | import("../../infrastructure/entities/permission.entity").Permission[]>;
}
