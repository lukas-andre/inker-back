import { Injectable } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Artist } from 'src/artists/entities/artist.entity';
import { UserType } from 'src/users/enums/userType.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginResponseDto } from '../dtos/loginResponse.dto';
import { JwtPayload } from '../interfaces/jwtPayload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  generateJwtByUserType(
    userType: string,
    user: User,
    entity: Customer | Artist,
  ): LoginResponseDto {
    console.log(`entity: ${JSON.stringify(entity)}`);
    const jwtPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      userType: UserType[userType],
      userTypeId: entity.id,
      permision: user.role.permissions.map(permission => ({
        c: permission.controller,
        a: permission.action,
      })),
    };
    const accessToken = this.jwtService.sign(jwtPayload, {
      issuer: this.configService.get('auth.jwtIssuer'),
      expiresIn: this.configService.get('auth.jwtExpiration'),
    });
    return {
      ...jwtPayload,
      accessToken,
      expiresIn: this.configService.get('auth.jwtExpiration'),
    };
  }
}
