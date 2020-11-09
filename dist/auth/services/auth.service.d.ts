import { User } from '../../users/entities/user.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Artist } from 'src/artists/entities/artist.entity';
import { JwtPayload } from '../interfaces/jwtPayload.interface';
export declare class AuthService {
    generateJwtByUserType(userType: string, user: User, entity: Customer | Artist): JwtPayload;
}
