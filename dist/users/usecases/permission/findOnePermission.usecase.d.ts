import { PermissionsService } from '../../domain/services/permissions.service';
import { Permission } from '../../infrastructure/entities/permission.entity';
import { FindOneOptions } from 'typeorm';
export declare class FindOnePermissionUseCase {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    execute(options: FindOneOptions<Permission>): Promise<Permission>;
}
