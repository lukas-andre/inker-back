import { Injectable } from '@nestjs/common';

import { RatingArtistUsecase } from '../../../reviews/usecases/ratingArtist.usecase';
import { BaseUseCase, UseCase } from '../../../global/domain/usecases/base.usecase';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { DomainUnProcessableEntity } from '../../../global/domain/exceptions/domain.exception';
import { AgendaEventProvider } from '../../infrastructure/providers/agendaEvent.provider';
import { AgendaProvider } from '../../infrastructure/providers/agenda.provider';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import { CUSTOMER_NOT_AUTHORIZED, EVENT_NOT_READY_FOR_REVIEW } from '../../domain/errors/codes';
import { ReviewArtistRequestDto } from '../../../reviews/dtos/reviewArtistRequest.dto';
import { DefaultResponseDto, DefaultResponseStatus } from '../../../global/infrastructure/dtos/defaultResponse.dto';

@Injectable()
export class EventReviewIntegrationUsecase extends BaseUseCase implements UseCase {
  constructor(
    private readonly requestContext: RequestContextService,
    private readonly agendaProvider: AgendaProvider,
    private readonly agendaEventProvider: AgendaEventProvider,
    // private readonly ratingArtistUsecase: RatingArtistUsecase,
  ) {
    super(EventReviewIntegrationUsecase.name);
  }

  async execute(
    agendaId: number,
    eventId: number,
    reviewData: ReviewArtistRequestDto,
  ): Promise<DefaultResponseDto> {
    const { isNotCustomer, userTypeId, userId } = this.requestContext;

    if (isNotCustomer) {
      throw new DomainUnProcessableEntity(CUSTOMER_NOT_AUTHORIZED);
    }

    // Get current event
    const event = await this.agendaEventProvider.findOne({
      where: { id: eventId, agenda: { id: agendaId }, customerId: userTypeId },
    });

    if (!event) {
      throw new DomainUnProcessableEntity('Event not found or not associated with this customer');
    }

    // Check if the event is ready for review
    if (event.status !== AgendaEventStatus.WAITING_FOR_REVIEW) {
      throw new DomainUnProcessableEntity(EVENT_NOT_READY_FOR_REVIEW);
    }

    // Get the artist's ID from the agenda
    const agenda = await this.agendaProvider.findOne({
      where: { id: agendaId },
    });

    if (!agenda) {
      throw new DomainUnProcessableEntity('Agenda not found');
    }

    // // Call the review service to create the review
    // const result = await this.ratingArtistUsecase.execute(
    //   agenda.artistId,
    //   eventId,
    //   userId,
    //   reviewData,
    // );

    // Update the event status to REVIEWED
    await this.agendaEventProvider.updateEventStatus(
      eventId,
      agendaId,
      AgendaEventStatus.REVIEWED,
    );

    return {
      status: DefaultResponseStatus.CREATED,
      data: 'Event reviewed successfully',
    };
  }
}