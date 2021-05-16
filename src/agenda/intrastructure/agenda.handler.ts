import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseHandler } from '../../global/infrastructure/base.handler';
import { AddEventUseCase } from '../usecases/addEvent.usecase';
import { AddEventReqDto } from './dtos/addEventReq.dto';

@Injectable()
export class AgendaHandler extends BaseHandler {
  constructor(
    private readonly addEventUseCase: AddEventUseCase,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  async handleAddEvent(dto: AddEventReqDto): Promise<any> {
    return this.resolve(await this.addEventUseCase.execute(dto));
  }
}
