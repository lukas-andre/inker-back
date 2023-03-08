import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '../../domain/interfaces/jwtPayload.interface';

@Injectable()
export class RequestService {
  constructor(private readonly jwtService: JwtService) {}

  private readonly logger = new Logger(RequestService.name);

  private token: string;
  private jwtPayload: JwtPayload;

  setToken(token: string) {
    this.token = token;

    try {
      this.jwtPayload = this.jwtService.verify(token);
    } catch (error) {
      this.logger.error(error);
    }
  }

  getToken() {
    return this.token;
  }

  getUserTypeId() {
    return this.jwtPayload.userTypeId;
  }

  getUserId() {
    return this.jwtPayload.id;
  }

  getJwtPayload() {
    return this.jwtPayload;
  }
}
