import { UsersService } from '../../users/domain/services/users.service';
import { ArtistsService } from '../../artists/domain/services/artists.service';
import { CustomersService } from '../../customers/domain/customers.service';
import { AuthService } from '../domain/auth.service';
import { DomainException } from '../../global/domain/exceptions/domain.exception';
import { DefaultLoginResult } from './interfaces/defaultLogin.result';
import { LoginParams } from './interfaces/defaultLogin.params';
export declare class DefaultLoginUseCase {
    private authService;
    private usersService;
    private artistsService;
    private customersService;
    constructor(authService: AuthService, usersService: UsersService, artistsService: ArtistsService, customersService: CustomersService);
    execute(loginParams: LoginParams): Promise<DefaultLoginResult | DomainException>;
    private defaultLogin;
    private findUserEntityByType;
}
