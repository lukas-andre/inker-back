import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExtractJwt } from 'passport-jwt';
import { DomainException } from '../domain/exceptions/domain.exception';
import { JwtPayload } from '../domain/interfaces/jwtPayload.interface';
import { resolveDomainException } from './exceptions/resolveDomainException';

@Injectable()
export class BaseHandler {
  constructor(private readonly JWTService: JwtService) {}

  getJwtPayloadFromRequest(request: any): JwtPayload {
    return this.JWTService.verify(
      ExtractJwt.fromAuthHeaderAsBearerToken()(request),
    ) as JwtPayload;
  }

  resolve<T>(result: DomainException | T) {
    if (result instanceof DomainException) throw resolveDomainException(result);

    return result;
  }
}
