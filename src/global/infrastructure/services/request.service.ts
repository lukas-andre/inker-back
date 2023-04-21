import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '../../domain/interfaces/jwtPayload.interface';

@Injectable()
export class RequestService {
  constructor(private readonly jwtService: JwtService) {}

  private readonly logger = new Logger(RequestService.name);

  private _token: string;
  private _jwtPayload: JwtPayload;

  set token(token: string) {
    this._token = token;

    try {
      this._jwtPayload = this.jwtService.verify(token);
    } catch (error) {
      this.logger.log(error);
    }
  }

  get token(): string | null {
    return this._token ?? null;
  }

  get userTypeId(): number | null {
    return this._jwtPayload ? this._jwtPayload.userTypeId ?? null : null;
  }

  get userId(): number | null {
    return this._jwtPayload ? this._jwtPayload.id ?? null : null;
  }

  get jwtPayload(): JwtPayload | null {
    return this._jwtPayload ?? null;
  }
}
