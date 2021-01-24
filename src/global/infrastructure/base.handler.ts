import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExtractJwt } from 'passport-jwt';
import { DomainException } from '../domain/exceptions/domain.exception';
import { JwtPayload } from '../domain/interfaces/jwtPayload.interface';
import { resolveDomainException } from './exceptions/resolveDomainException';

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
      this.logger.error(JSON.stringify(e));
    }
  }

  resolve<T>(result: DomainException | T) {
    if (result instanceof DomainException) throw resolveDomainException(result);

    return result;
  }
}
