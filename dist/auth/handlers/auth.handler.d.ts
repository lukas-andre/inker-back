import { HttpException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { User } from '../../users/entities/user.entity';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { ArtistsService } from '../../artists/services/artists.service';
import { CustomersService } from '../../customers/services/customers.service';
import { JwtPayload } from '../interfaces/jwtPayload.interface';
import { Customer } from 'src/customers/entities/customer.entity';
import { Artist } from 'src/artists/entities/artist.entity';
export declare class AuthHandler {
    private authService;
    private usersService;
    private artistsService;
    private customersService;
    constructor(authService: AuthService, usersService: UsersService, artistsService: ArtistsService, customersService: CustomersService);
    login(loginDto: LoginDto): Promise<JwtPayload>;
    defaultLogin(user: User, loginDto: LoginDto): Promise<JwtPayload | HttpException>;
    findUserEntityByType(userType: string, userId: string): Promise<Customer | Artist>;
}
