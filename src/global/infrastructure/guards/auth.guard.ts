import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ExtractJwt } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
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
    console.log('calledController: ', calledController);
    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    console.log('jwt: ', jwt);

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
    
    if (!verifyJwt) {
      return false;
    }

    const permission = verifyJwt.permision.find(
      p => p.c == calledController,
    );

    if (!permission) {
      return false;
    }

    return true;
  }
}
