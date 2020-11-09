import { Injectable } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Artist } from 'src/artists/entities/artist.entity';
import { JwtPayload } from '../interfaces/jwtPayload.interface';
import { UserType } from 'src/users/enums/userType.enum';

@Injectable()
export class AuthService {
  generateJwtByUserType(
    userType: string,
    user: User,
    entity: Customer | Artist,
  ): JwtPayload {
    console.log(`entity: ${entity}`)
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      userType: UserType[userType],
      permision: user.role.permissions.map(permission => ({
        c: permission.controller,
        a: permission.action,
      })),
    };
  }
}
