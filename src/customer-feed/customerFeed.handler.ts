import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '../global/domain/interfaces/jwtPayload.interface';
import { BaseHandler } from '../global/infrastructure/base.handler';

@Injectable()
export class CustomerFeedHandler extends BaseHandler {
  constructor(private readonly jwtService: JwtService) {
    super(jwtService);
  }

  async handleGetCustomerFeed(request: unknown): Promise<any> {
    const jwtPayload: JwtPayload = this.getJwtPayloadFromRequest(request);
  }
}
