import { FindOneOptions } from 'typeorm';
import { PermissionsService } from '../../domain/services/permissions.service';
import { Permission } from '../../infrastructure/entities/permission.entity';
export declare class FindAllPermissionsUseCase {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    execute(options: FindOneOptions<Permission>): Promise<Permission[]>;
}
