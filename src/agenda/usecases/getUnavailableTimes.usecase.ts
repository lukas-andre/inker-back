import { Injectable, Logger } from '@nestjs/common';
import { AgendaSettingsService } from '../services/agendaSettings.service';
import { AgendaUnavailableTime } from '../infrastructure/entities/agendaUnavailableTime.entity';

@Injectable()
export class GetUnavailableTimesUseCase {
  private readonly logger = new Logger(GetUnavailableTimesUseCase.name);

  constructor(private readonly agendaSettingsService: AgendaSettingsService) {}

  async execute(agendaId: string): Promise<AgendaUnavailableTime[]> {
    this.logger.log(`Getting unavailable times for agenda ${agendaId}`);
    return this.agendaSettingsService.getUnavailableTimes(agendaId);
  }
}