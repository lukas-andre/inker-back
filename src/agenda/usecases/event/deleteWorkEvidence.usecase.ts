import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BaseUseCase, UseCase } from '../../../global/domain/usecases/base.usecase';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { MultimediasService } from '../../../multimedias/services/multimedias.service';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';

export interface IDeleteWorkEvidenceCommand {
  actor: {
    id: string;
    type: UserType;
  };
  eventId: string;
}

@Injectable()
export class DeleteWorkEvidenceUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly agendaEventRepository: AgendaEventRepository,
    private readonly multimediasService: MultimediasService,
  ) {
    super(DeleteWorkEvidenceUseCase.name);
  }

  async execute(command: IDeleteWorkEvidenceCommand): Promise<AgendaEvent> {
    const { actor, eventId } = command;

    const event = await this.agendaEventRepository.findOne({ where: { id: eventId }, relations: ['agenda'] });
    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    if (actor.type !== UserType.ARTIST || event.agenda.artistId !== actor.id) {
        throw new ForbiddenException('Only the assigned artist can delete work evidence from this event.');
    }

    // Business Rule: Evidence can only be deleted if the process is not finalized.
    if (![AgendaEventStatus.WAITING_FOR_PHOTOS, AgendaEventStatus.WAITING_FOR_REVIEW].includes(event.status)) {
        throw new ForbiddenException('Work evidence cannot be deleted in the current event state.');
    }
    
    if (!event.workEvidence) {
      this.logger.warn(`Attempted to delete work evidence for event ${eventId}, but none was found.`);
      return event; // Nothing to do.
    }

    await this.multimediasService.deleteWorkEvidence(event.workEvidence);

    event.workEvidence = null;

    return this.agendaEventRepository.save(event);
  }
} 