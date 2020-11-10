import { User } from '../../users/entities/user.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Artist } from 'src/artists/entities/artist.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginResponseDto } from '../dtos/loginResponse.dto';
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    constructor(jwtService: JwtService, configService: ConfigService);
    generateJwtByUserType(userType: string, user: User, entity: Customer | Artist): LoginResponseDto;
}
