import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { AgendaProvider } from '../infrastructure/providers/agenda.provider';
import { AgendaEventProvider } from '../infrastructure/providers/agendaEvent.provider';
import { UpdateEventNotesReqDto } from '../infrastructure/dtos/updateEventNotesReq.dto';

@Injectable()
export class UpdateEventNotesUseCase {
  private readonly logger = new Logger(UpdateEventNotesUseCase.name);

  constructor(
    private readonly agendaProvider: AgendaProvider,
    private readonly agendaEventProvider: AgendaEventProvider,
  ) {}

  async execute(
    agendaId: number,
    eventId: number,
    dto: UpdateEventNotesReqDto,
  ): Promise<void> {
    this.logger.log(`Updating notes for event ${eventId} in agenda ${agendaId}`);

    // Verify event exists and belongs to the agenda
    const event = await this.agendaEventProvider.findOne({
      where: { id: eventId },
      relations: ['agenda'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    if (event.agenda.id !== agendaId) {
      throw new BadRequestException(`Event ${eventId} does not belong to agenda ${agendaId}`);
    }

    // Update the event notes
    await this.agendaEventProvider.update(eventId, {
      notes: dto.notes,
    });
  }
}