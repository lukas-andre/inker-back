import { Injectable, Logger } from '@nestjs/common';
import { AgendaSettingsService } from '../../services/agendaSettings.service';

@Injectable()
export class DeleteUnavailableTimeUseCase {
  private readonly logger = new Logger(DeleteUnavailableTimeUseCase.name);

  constructor(private readonly agendaSettingsService: AgendaSettingsService) {}

  async execute(agendaId: string, id: string): Promise<void> {
    this.logger.log(`Deleting unavailable time ${id} for agenda ${agendaId}`);
    return this.agendaSettingsService.deleteUnavailableTime(agendaId, id);
  }
}