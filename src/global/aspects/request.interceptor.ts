import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';
import { Observable } from 'rxjs';

import { RequestService } from '../infrastructure/services/request.service';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  constructor(private readonly requestService: RequestService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    this.requestService.setToken(jwt);

    return next.handle();
  }
}
