import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExtractJwt } from 'passport-jwt';

import { JwtPayload } from '../domain/interfaces/jwtPayload.interface';
import { logCatchedError } from '../domain/utils/logCatchedError';

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
      logCatchedError(e.message, this.logger);
      throw new ForbiddenException('Invalid JWT');
    }
  }
}
