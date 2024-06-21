import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClsService, ClsStore } from 'nestjs-cls';
import { ExtractJwt } from 'passport-jwt';
import { Observable } from 'rxjs';

import { JwtPayload } from '../../domain/interfaces/jwtPayload.interface';

export interface InkerClsStore extends ClsStore {
  jwt: JwtPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly cls: ClsService<InkerClsStore>,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const calledController = context.getClass().name;
    const calledAction = context.getHandler().name;
    console.log('calledAcion: ', calledAction);
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
    if (!verifyJwt) {
      return false;
    }

    this.cls.set('jwt', verifyJwt);

    // It's important to activate this soon

    // const permission = verifyJwt.permission.find(p => p.c == calledController);
    // console.log('permission: ', permission);

    // if (!permission) {
    //   return false;
    // }

    return true;
  }
}
