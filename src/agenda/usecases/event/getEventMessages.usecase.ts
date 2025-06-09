import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import {
  BaseUseCase,
  UseCase,
} from '../../../global/domain/usecases/base.usecase';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { DomainNotFound } from '../../../global/domain/exceptions/domain.exception';
import { AgendaEvent, EventMessage } from '../../infrastructure/entities/agendaEvent.entity';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { UserType } from '../../../users/domain/enums/userType.enum';
import { AGENDA_EVENT_NOT_EXISTS } from '../../domain/errors/codes';
import { EventMessageDto } from '../../infrastructure/dtos/eventMessage.dto';

@Injectable()
export class GetEventMessagesUseCase extends BaseUseCase implements UseCase {
  constructor(
    private readonly agendaEventRepo: AgendaEventRepository,
    private readonly contextService: RequestContextService,
  ) {
    super(GetEventMessagesUseCase.name);
  }

  async execute(eventId: string): Promise<EventMessageDto[]> {
    const { userId, userTypeId, userType } = this.contextService;

    if (!userId || !userTypeId || !userType) {
      throw new UnauthorizedException('User context not found');
    }

    const event = await this.agendaEventRepo.findOne({
      where: { id: eventId },
      relations: ['agenda'], // For artistId to check authorization
    });

    if (!event) {
      throw new DomainNotFound(AGENDA_EVENT_NOT_EXISTS);
    }
    if (!event.agenda) {
        this.logger.error(`Agenda relationship not loaded for event ${eventId}`);
        throw new DomainNotFound('Event agenda details not found for authorization check.');
    }

    // Authorization Check: User must be the customer or the artist of the event
    const isCustomer = userType === UserType.CUSTOMER && event.customerId === userTypeId;
    const isArtist = userType === UserType.ARTIST && event.agenda.artistId === userTypeId;

    if (!isCustomer && !isArtist) {
      throw new ForbiddenException(
        'User is not authorized to view messages for this event',
      );
    }

    // Transform EventMessage entities to EventMessageDto array
    // Ensure messages are sorted by timestamp if not already
    const sortedMessages = (event.messages || []).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    return sortedMessages.map(msg => ({
        id: msg.id,
        eventId: msg.eventId,
        senderId: msg.senderId,
        senderType: msg.senderType,
        message: msg.message,
        imageUrl: msg.imageUrl,
        createdAt: msg.createdAt,
    }));
  }
} 