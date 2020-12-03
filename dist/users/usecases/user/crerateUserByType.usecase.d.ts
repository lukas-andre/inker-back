import { ConfigService } from '@nestjs/config';
import { ArtistsService } from '../../../artists/domain/services/artists.service';
import { CustomersService } from '../../../customers/domain/customers.service';
import { RolesService } from '../../domain/services/roles.service';
import { UsersService } from '../../domain/services/users.service';
import { CreateUserByTypeParams } from './interfaces/createUserByType.params';
import { DomainConflictException } from '../../../global/domain/exceptions/domainConflict.exception';
export declare class CreateUserByTypeUseCase {
    private readonly usersService;
    private readonly artistsService;
    private readonly customerService;
    private readonly rolesService;
    private readonly configService;
    constructor(usersService: UsersService, artistsService: ArtistsService, customerService: CustomersService, rolesService: RolesService, configService: ConfigService);
    execute(createUserParams: CreateUserByTypeParams): Promise<DomainConflictException | import("../../domain/models/user.model").IUser>;
    private handleCreateByUserType;
    private createArtist;
    private createCustomer;
    private rollbackCreate;
    private handleCreateError;
}
