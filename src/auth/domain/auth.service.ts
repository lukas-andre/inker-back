import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Artist } from '../../artists/infrastructure/entities/artist.entity';
import { Customer } from '../../customers/infrastructure/entities/customer.entity';
import {
  FullJwtPayload,
  JwtPayload,
} from '../../global/domain/interfaces/jwtPayload.interface';
import { UserType } from '../../users/domain/enums/userType.enum';
import { User } from '../../users/infrastructure/entities/user.entity';
import { Permission } from '../../users/infrastructure/entities/permission.entity';

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
  ): FullJwtPayload {
    const jwtPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullname: [entity.firstName, entity.lastName].join(' '),
      userType: UserType[userType],
      userTypeId: entity.id,
      profileThumbnail: entity.profileThumbnail,
      permission: (user as User & { permissions: Permission[] }).permissions.map(permission => ({
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
    } as FullJwtPayload;
  }
}
