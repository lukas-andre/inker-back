import { Injectable, Logger } from '@nestjs/common';

import { CreateUnavailableTimeReqDto } from '../../infrastructure/dtos/createUnavailableTimeReq.dto';
import { AgendaUnavailableTime } from '../../infrastructure/entities/agendaUnavailableTime.entity';
import { AgendaSettingsService } from '../../services/agendaSettings.service';

@Injectable()
export class CreateUnavailableTimeUseCase {
  private readonly logger = new Logger(CreateUnavailableTimeUseCase.name);

  constructor(private readonly agendaSettingsService: AgendaSettingsService) {}

  async execute(
    agendaId: string,
    dto: CreateUnavailableTimeReqDto,
  ): Promise<AgendaUnavailableTime> {
    this.logger.log(`Creating unavailable time for agenda ${agendaId}`);
    return this.agendaSettingsService.createUnavailableTime(agendaId, dto);
  }
}
