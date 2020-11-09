import { CreateUserDto } from '../dtos/createUser.dto';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../services/users.service';
import { UserType } from '../enums/userType.enum';
import { CustomersService } from '../../customers/services/customers.service';
import { ServiceError } from '../../global/interfaces/serviceError';
import { CreateArtistDto } from '../../artists/dtos/createArtist.dto';
import { ArtistsService } from '../../artists/services/artists.service';
import { RolesService } from '../services/roles.service';
import { Artist } from '../../artists/entities/artist.entity';
export declare class UsersHandler {
    private readonly usersService;
    private readonly artistsService;
    private readonly customerService;
    private readonly rolesService;
    private readonly configService;
    constructor(usersService: UsersService, artistsService: ArtistsService, customerService: CustomersService, rolesService: RolesService, configService: ConfigService);
    handleCreate(createUserDto: CreateUserDto): Promise<{
        id: string;
        username: string;
        email: string;
        active: boolean;
        userType: UserType;
        role: import("../entities/role.entity").Role;
        created_at: Date;
        updated_at: Date;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
    }>;
    private handleCreateByUserType;
    createArtist(createArtistDto: CreateArtistDto): Promise<Artist | ServiceError>;
    private createCustomer;
    private rollbackCreate;
    private handleCreateError;
}
