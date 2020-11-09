import { ModulesContainer } from '@nestjs/core';
import { Permission } from '../entities/permission.entity';
import { Repository } from 'typeorm';
import { ServiceError } from 'src/global/interfaces/serviceError';
export declare class InitialPermissionsService {
    private readonly container;
    private readonly permissionsRepository;
    private readonly serviceName;
    private readonly logger;
    constructor(container: ModulesContainer, permissionsRepository: Repository<Permission>);
    initPermissions(): Promise<Permission[] | ServiceError>;
    getAllRoutes(): Promise<Permission[] | ServiceError>;
}
