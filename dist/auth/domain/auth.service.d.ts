import { User } from '../../users/infrastructure/entities/user.entity';
import { Customer } from '../../customers/infrastructure/entities/customer.entity';
import { Artist } from '../../artists/infrastructure/entities/artist.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FullJwtPayload } from './interfaces/jwtPayload.interface';
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    constructor(jwtService: JwtService, configService: ConfigService);
    generateJwtByUserType(userType: string, user: User, entity: Customer | Artist): FullJwtPayload;
}
