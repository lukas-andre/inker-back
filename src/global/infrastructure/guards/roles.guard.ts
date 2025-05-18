import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { InkerClsStore } from './auth.guard'; // Import the CLS store type from auth.guard

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly cls: ClsService<InkerClsStore>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles specified, access granted
    }

    const jwtPayload = this.cls.get('jwt');

    if (!jwtPayload || !jwtPayload.userType) {
      return false; // No user or userType in JWT payload, access denied
    }
    
    // Check if the user's userType is one of the required roles
    return requiredRoles.some((role) => jwtPayload.userType === role);
  }
} 