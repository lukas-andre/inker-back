import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';

import { Customer } from '../../../customers/infrastructure/entities/customer.entity';
import { CustomerRepository } from '../../../customers/infrastructure/providers/customer.repository';
import { DomainNotFound } from '../../../global/domain/exceptions/domain.exception';
import {
  RsvpAcceptedJobType,
  RsvpDeclinedJobType,
} from '../../../queues/notifications/domain/schemas/agenda';
import { queues } from '../../../queues/queues';
import { Agenda } from '../../infrastructure/entities/agenda.entity';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaInvitationRepository } from '../../infrastructure/repositories/agendaInvitation.provider';
import { RsvpUseCase } from '../event/rsvp.usecase';

describe('RsvpUseCase', () => {
  let useCase: RsvpUseCase;
  let agendaProvider: DeepMocked<AgendaRepository>;
  let agendaInvitationProvider: DeepMocked<AgendaInvitationRepository>;
  let customerProvider: DeepMocked<CustomerRepository>;
  let notificationQueue: DeepMocked<Queue>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RsvpUseCase,
        {
          provide: AgendaRepository,
          useValue: createMock<AgendaRepository>(),
        },
        {
          provide: AgendaInvitationRepository,
          useValue: createMock<AgendaInvitationRepository>(),
        },
        {
          provide: CustomerRepository,
          useValue: createMock<CustomerRepository>(),
        },
        {
          provide: getQueueToken(queues.notification.name),
          useValue: createMock<Queue>(),
        },
      ],
    }).compile();

    useCase = module.get<RsvpUseCase>(RsvpUseCase);
    agendaProvider = module.get(AgendaRepository);
    agendaInvitationProvider = module.get(AgendaInvitationRepository);
    customerProvider = module.get(CustomerRepository);
    notificationQueue = module.get(getQueueToken(queues.notification.name));
  });

  it('should throw DomainNotFound if agenda does not exist', async () => {
    const customerId = 1;
    const agendaId = 1;
    const eventId = 1;
    const willAttend = true;

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

    agendaProvider.findById.mockResolvedValueOnce(mockAgenda);
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

    agendaProvider.findById.mockResolvedValueOnce(mockAgenda);
    customerProvider.findById.mockResolvedValueOnce(mockCustomer);

    await useCase.execute(customerId, agendaId, eventId, willAttend);

    expect(agendaInvitationProvider.updateStatus).toHaveBeenCalledWith(
      eventId,
      'accepted',
    );
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

    agendaProvider.findById.mockResolvedValueOnce(mockAgenda);
    customerProvider.findById.mockResolvedValueOnce(mockCustomer);

    await useCase.execute(customerId, agendaId, eventId, willAttend);

    expect(agendaInvitationProvider.updateStatus).toHaveBeenCalledWith(
      eventId,
      'rejected',
    );
    expect(notificationQueue.add).toHaveBeenCalledWith(mockQueueMessage);
  });
});
