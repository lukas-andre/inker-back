import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExtractJwt } from 'passport-jwt';
import { Observable } from 'rxjs';
import { JwtPayload } from '../../domain/interfaces/jwtPayload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const calledController = context.getClass().name;
    const calledAction = context.getHandler().name;
    console.log('calledAction: ', calledAction);
    console.log('calledController: ', calledController);

    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    if (!jwt) {
      return false;
    }

    let verifyJwt: JwtPayload;
    try {
      verifyJwt = this.jwtService.verify(jwt);
    } catch (error) {
      this.logger.error(error);
      return false;
    }
    console.log('verifyJwt: ', verifyJwt);
    if (!verifyJwt) {
      return false;
    }

    const permission = verifyJwt.permission.find(p => p.c == calledController);
    console.log('permission: ', permission);

    if (!permission) {
      return false;
    }

    return true;
  }
}
