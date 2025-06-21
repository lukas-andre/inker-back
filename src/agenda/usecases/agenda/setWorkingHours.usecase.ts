import { Injectable, Logger } from '@nestjs/common';

import { SetWorkingHoursReqDto } from '../../infrastructure/dtos/setWorkingHoursReq.dto';
import { AgendaSettingsService } from '../../services/agendaSettings.service';

@Injectable()
export class SetWorkingHoursUseCase {
  private readonly logger = new Logger(SetWorkingHoursUseCase.name);

  constructor(private readonly agendaSettingsService: AgendaSettingsService) {}

  async execute(agendaId: string, dto: SetWorkingHoursReqDto): Promise<void> {
    this.logger.log(`Setting working hours for agenda ${agendaId}`);
    return this.agendaSettingsService.setWorkingHours(agendaId, dto);
  }
}
