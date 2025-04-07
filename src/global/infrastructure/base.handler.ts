import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClsService } from 'nestjs-cls';
import { ExtractJwt } from 'passport-jwt';

import { UserType } from '../../users/domain/enums/userType.enum';
import {
  JwtPayload,
  JwtPermission,
} from '../domain/interfaces/jwtPayload.interface';
import { logCatchedError } from '../domain/utils/logCatchedError';

import { InkerClsStore } from './guards/auth.guard';

@Injectable()
export class BaseHandler {
  private readonly logger = new Logger(BaseHandler.name);

  constructor(private readonly JWTService: JwtService) {}

  getJwtPayloadFromRequest(request: any): JwtPayload {
    try {
      return this.JWTService.verify(
        ExtractJwt.fromAuthHeaderAsBearerToken()(request),
      ) as JwtPayload;
    } catch (e) {
      logCatchedError((e as Error).message, this.logger);
      throw new ForbiddenException('Invalid JWT');
    }
  }
}
