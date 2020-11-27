import { Artist } from '../../../artists/infrastructure/entities/artist.entity';
import { Customer } from '../../../customers/infrastructure/entities/customer.entity';
import { User } from '../../../users/infrastructure/entities/user.entity';
import { LoginResDto } from '../../infrasctructure/dtos/loginRes.dto';

export interface AuthService {
  generateJwtByUserType(
    userType: string,
    user: User,
    entity: Customer | Artist,
  ): LoginResDto;
}

export const AUTH_SERVICE_DI_TOKEN = 'AUTH_SERVICE';
