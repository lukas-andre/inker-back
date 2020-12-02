import { InitialPermissionsService } from '../../domain/services/initialPermissions.service';
export declare class FindAllRoutesUseCase {
    private readonly permissionsService;
    constructor(permissionsService: InitialPermissionsService);
    execute(): Promise<import("../../infrastructure/entities/permission.entity").Permission[] | import("../../../global/domain/interfaces/serviceError").ServiceError>;
}
