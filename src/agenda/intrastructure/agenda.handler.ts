import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseHandler } from '../../global/infrastructure/base.handler';

@Injectable()
export class AgendaHandler extends BaseHandler {
  constructor(private readonly jwtService: JwtService) {
    super(jwtService);
  }
}
