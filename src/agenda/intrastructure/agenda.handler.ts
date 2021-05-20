import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseHandler } from '../../global/infrastructure/base.handler';
import { AddEventUseCase } from '../usecases/addEvent.usecase';
import { CancelEventUseCase } from '../usecases/cancelEvent.usecase';
import { UpdateEventUseCase } from '../usecases/updateEvent.usecase';
import { AddEventReqDto } from './dtos/addEventReq.dto';
import { UpdateEventReqDto } from './dtos/updateEventReq.dto';

@Injectable()
export class AgendaHandler extends BaseHandler {
  constructor(
    private readonly addEventUseCase: AddEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly cancelEventUseCase: CancelEventUseCase,
    private readonly jwtService: JwtService,
  ) {
    super(jwtService);
  }

  async handleAddEvent(dto: AddEventReqDto): Promise<any> {
    return this.resolve(await this.addEventUseCase.execute(dto));
  }

  async handleUpdateEvent(dto: UpdateEventReqDto, id: string): Promise<any> {
    return this.resolve(await this.updateEventUseCase.execute(dto, id));
  }

  async handleCancelEvent(eventId: string, agendaId: string): Promise<any> {
    return this.resolve(
      await this.cancelEventUseCase.execute(eventId, agendaId),
    );
  }
}
