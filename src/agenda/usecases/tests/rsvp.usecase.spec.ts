import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { CustomerRepository } from '../../../customers/infrastructure/providers/customer.repository';
import { DomainNotFound, DomainUnProcessableEntity } from '../../../global/domain/exceptions/domain.exception';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { RsvpUseCase } from '../event/rsvp.usecase';

import { ChangeEventStatusUsecase } from '../event/changeEventStatus.usecase';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { RequestContextService } from '../../../global/infrastructure/services/requestContext.service';
import { AgendaEventTransition } from '../../domain/services/eventStateMachine.service';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity';
import { getQueueToken } from '@nestjs/bull';
import { queues } from '../../../queues/queues';

describe('RsvpUseCase', () => {
  let useCase: RsvpUseCase;
  let changeEventStatusUsecase: DeepMocked<ChangeEventStatusUsecase>;
  let agendaEventProvider: DeepMocked<AgendaEventRepository>;
  let requestContextService: DeepMocked<RequestContextService>;

  const mockCustomerId = 'cust-uuid-123';
  const mockAgendaId = 'agenda-uuid-456';
  const mockEventId = 'event-uuid-789';
  const mockAuthenticatedUserId = 'auth-user-uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RsvpUseCase,
        {
          provide: AgendaRepository,
          useValue: createMock<AgendaRepository>(),
        },
        {
          provide: CustomerRepository,
          useValue: createMock<CustomerRepository>(),
        },
        {
          provide: ChangeEventStatusUsecase,
          useValue: createMock<ChangeEventStatusUsecase>(),
        },
        {
          provide: AgendaEventRepository,
          useValue: createMock<AgendaEventRepository>(),
        },
        {
          provide: RequestContextService,
          useValue: createMock<RequestContextService>(),
        },
      ],
    }).compile();

    useCase = module.get<RsvpUseCase>(RsvpUseCase);
    changeEventStatusUsecase = module.get(ChangeEventStatusUsecase);
    agendaEventProvider = module.get(AgendaEventRepository);
    requestContextService = module.get(RequestContextService);

    requestContextService.userId = mockAuthenticatedUserId;
    requestContextService.userTypeId = mockCustomerId;
    requestContextService.isNotArtist = true;
  });

  it('should throw DomainNotFound if agenda does not exist', async () => {
    const customerId = 1;
    const agendaId = 1;
    const eventId = 1;
    const willAttend = true;

    const agendaProvider = module.get(AgendaRepository);
    agendaProvider.findById.mockResolvedValueOnce(undefined);

    await expect(
      useCase.execute(customerId, agendaId, eventId, willAttend),
    ).rejects.toThrow(DomainNotFound);
  });

  it('should throw DomainNotFound if customer does not exist', async () => {
    const customerId = 1;
    const agendaId = 1;
    const eventId = 1;
    const willAttend = true;
    const mockAgenda = { id: 1, artistId: 1 } as Agenda;

    const agendaProvider = module.get(AgendaRepository);
    agendaProvider.findById.mockResolvedValueOnce(mockAgenda);
    const customerProvider = module.get(CustomerRepository);
    customerProvider.findById.mockResolvedValueOnce(undefined);

    await expect(
      useCase.execute(customerId, agendaId, eventId, willAttend),
    ).rejects.toThrow(DomainNotFound);
  });

  it('should update the invitation status and publish a message to the queue', async () => {
    const customerId = 1;
    const agendaId = 1;
    const eventId = 1;
    const willAttend = true;
    const mockAgenda = { id: 1, artistId: 1 } as Agenda;
    const mockCustomer = { id: 1 } as Customer;
    const mockQueueMessage: RsvpAcceptedJobType = {
      jobId: 'RSVP_ACCEPTED',
      metadata: {
        eventId,
        artistId: mockAgenda.artistId,
        customerId,
      },
      notificationTypeId: 'EMAIL',
    };

    const agendaProvider = module.get(AgendaRepository);
    agendaProvider.findById.mockResolvedValueOnce(mockAgenda);
    const customerProvider = module.get(CustomerRepository);
    customerProvider.findById.mockResolvedValueOnce(mockCustomer);

    await useCase.execute(customerId, agendaId, eventId, willAttend);

    const agendaInvitationProvider = module.get(AgendaInvitationRepository);
    expect(agendaInvitationProvider.updateStatus).toHaveBeenCalledWith(
      eventId,
      'accepted',
    );
    const notificationQueue = module.get(getQueueToken(queues.notification.name));
    expect(notificationQueue.add).toHaveBeenCalledWith(mockQueueMessage);
  });

  it('should update the invitation status to rejected and publish a message to the queue', async () => {
    const customerId = 1;
    const agendaId = 1;
    const eventId = 1;
    const willAttend = false;
    const mockAgenda = { id: 1, artistId: 1 } as Agenda;
    const mockCustomer = { id: 1 } as Customer;
    const mockQueueMessage: RsvpDeclinedJobType = {
      jobId: 'RSVP_DECLINED',
      metadata: {
        eventId,
        artistId: mockAgenda.artistId,
        customerId,
      },
      notificationTypeId: 'EMAIL',
    };

    const agendaProvider = module.get(AgendaRepository);
    agendaProvider.findById.mockResolvedValueOnce(mockAgenda);
    const customerProvider = module.get(CustomerRepository);
    customerProvider.findById.mockResolvedValueOnce(mockCustomer);

    await useCase.execute(customerId, agendaId, eventId, willAttend);

    const agendaInvitationProvider = module.get(AgendaInvitationRepository);
    expect(agendaInvitationProvider.updateStatus).toHaveBeenCalledWith(
      eventId,
      'rejected',
    );
    const notificationQueue = module.get(getQueueToken(queues.notification.name));
    expect(notificationQueue.add).toHaveBeenCalledWith(mockQueueMessage);
  });

  it('should call ChangeEventStatusUsecase with CONFIRM action when willAttend is true', async () => {
    const mockEvent = { id: mockEventId, customerId: mockCustomerId } as AgendaEvent;
    agendaEventProvider.findOne.mockResolvedValueOnce(mockEvent);

    await useCase.execute(mockAgendaId, mockEventId, true);

    expect(agendaEventProvider.findOne).toHaveBeenCalledWith({
        where: { id: mockEventId, agenda: { id: mockAgendaId } },
        select: ['id', 'customerId']
    });
    expect(changeEventStatusUsecase.execute).toHaveBeenCalledWith(
      mockAgendaId,
      mockEventId,
      { eventAction: AgendaEventTransition.CONFIRM },
    );
  });

  it('should call ChangeEventStatusUsecase with REJECT action when willAttend is false', async () => {
    const mockEvent = { id: mockEventId, customerId: mockCustomerId } as AgendaEvent;
    agendaEventProvider.findOne.mockResolvedValueOnce(mockEvent);
    
    await useCase.execute(mockAgendaId, mockEventId, false);

    expect(agendaEventProvider.findOne).toHaveBeenCalledWith({
        where: { id: mockEventId, agenda: { id: mockAgendaId } },
        select: ['id', 'customerId']
    });
    expect(changeEventStatusUsecase.execute).toHaveBeenCalledWith(
      mockAgendaId,
      mockEventId,
      { eventAction: AgendaEventTransition.REJECT },
    );
  });

  it('should throw DomainUnProcessableEntity if RequestContext indicates an artist', async () => {
    requestContextService.isNotArtist = false;

    await expect(
      useCase.execute(mockAgendaId, mockEventId, true),
    ).rejects.toThrow(DomainUnProcessableEntity);
    expect(changeEventStatusUsecase.execute).not.toHaveBeenCalled();
  });

  it('should throw DomainNotFound if event is not found', async () => {
    agendaEventProvider.findOne.mockResolvedValueOnce(undefined);

    await expect(
      useCase.execute(mockAgendaId, mockEventId, true),
    ).rejects.toThrow(DomainNotFound);
    expect(changeEventStatusUsecase.execute).not.toHaveBeenCalled();
  });

  it('should throw DomainUnProcessableEntity if event.customerId does not match authenticated customerId', async () => {
    const mockEventWithDifferentCustomer = { id: mockEventId, customerId: 'other-cust-uuid' } as AgendaEvent;
    agendaEventProvider.findOne.mockResolvedValueOnce(mockEventWithDifferentCustomer);

    await expect(
      useCase.execute(mockAgendaId, mockEventId, true),
    ).rejects.toThrow(DomainUnProcessableEntity);
    expect(changeEventStatusUsecase.execute).not.toHaveBeenCalled();
  });
});
