import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ExtractJwt } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../../auth/domain/interfaces/jwtPayload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const calledController = context.getClass().name;
    const calledAction = context.getHandler().name;
    console.log('calledController: ', calledController);
    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    console.log('jwt: ', jwt);

    if (!jwt) {
      return false;
    }

    const verify = this.jwtService.verify(jwt);
    console.log('verify: ', verify);

    if (!verify) {
      return false;
    }

    const permission = (verify as JwtPayload).permision.find(
      p => p.c == calledController,
    );
    console.log('permission: ', permission);

    if (!permission) {
      return false;
    }

    return true;
  }
}
