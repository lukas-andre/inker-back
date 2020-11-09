import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PermissionsService } from '../services/permissions.service';
import { InitialPermissionsService } from '../services/initialPermissions.service';
import { ServiceError } from '../../global/interfaces/serviceError';
import { Permission } from '../entities/permission.entity';
export declare class PermissionsHandler {
    private readonly permissionsService;
    private readonly initialPermissionsService;
    private readonly configService;
    constructor(permissionsService: PermissionsService, initialPermissionsService: InitialPermissionsService, configService: ConfigService);
    handleInitial(): Promise<Permission[] | HttpException>;
    findRoutes(): Promise<Permission[] | ServiceError>;
    findOne(id: number): Promise<Permission>;
    findAll(query: any): Promise<Permission[]>;
}
