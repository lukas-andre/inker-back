import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { UpdateAgendaSettingsReqDto } from '../../infrastructure/dtos/updateAgendaSettingsReq.dto';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';

@Injectable()
export class UpdateAgendaSettingsUseCase {
  private readonly logger = new Logger(UpdateAgendaSettingsUseCase.name);

  constructor(private readonly agendaProvider: AgendaRepository) {}

  async execute(
    agendaId: string,
    dto: UpdateAgendaSettingsReqDto,
  ): Promise<void> {
    this.logger.log(`Updating settings for agenda ${agendaId}`);

    // Find the agenda
    const agenda = await this.agendaProvider.findOne({
      where: { id: agendaId },
    });
    if (!agenda) {
      throw new NotFoundException(`Agenda with ID ${agendaId} not found`);
    }

    // Create update object with only provided fields
    const updateData: Partial<UpdateAgendaSettingsReqDto> = {};

    if (dto.open !== undefined) {
      updateData.open = dto.open;
    }

    if (dto.public !== undefined) {
      updateData.public = dto.public;
    }

    // Update the agenda if there's anything to update
    if (Object.keys(updateData).length > 0) {
      await this.agendaProvider.update(agendaId, updateData);
    }
  }
}
