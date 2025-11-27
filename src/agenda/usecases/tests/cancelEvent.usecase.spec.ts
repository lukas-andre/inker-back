import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';

import {
  DomainInternalServerError,
  DomainNotFound,
} from '../../../global/domain/exceptions/domain.exception';
import { S3Client } from '../../../global/infrastructure/clients/s3.client';
import { AgendaEventCanceledJobType } from '../../../queues/notifications/domain/schemas/agenda';
import { queues } from '../../../queues/queues';
import { Agenda } from '../../infrastructure/entities/agenda.entity';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { CancelEventUseCase } from '../event/cancelEvent.usecase';

describe('CancelEventUseCase', () => {
  let useCase: CancelEventUseCase;
  let agendaProvider: DeepMocked<AgendaRepository>;
  let agendaEventProvider: DeepMocked<AgendaEventRepository>;
  let notificationQueue: DeepMocked<Queue>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelEventUseCase,
        {
          provide: AgendaRepository,
          useValue: createMock<AgendaRepository>(),
        },
        {
          provide: AgendaEventRepository,
          useValue: createMock<AgendaEventRepository>(),
        },
        {
          provide: S3Client,
          useValue: createMock<S3Client>(),
        },
        {
          provide: getQueueToken(queues.notification.name),
          useValue: createMock<Queue>(),
        },
      ],
    }).compile();

    useCase = module.get<CancelEventUseCase>(CancelEventUseCase);
    agendaProvider = module.get(AgendaRepository);
    agendaEventProvider = module.get(AgendaEventRepository);
    notificationQueue = module.get(getQueueToken(queues.notification.name));
  });

  it('should throw DomainNotFound if agenda does not exist', async () => {
    const agendaId = 1;
    const eventId = 1;

    agendaProvider.findById.mockResolvedValueOnce(undefined);

    await expect(useCase.execute(eventId, agendaId)).rejects.toThrow(
      DomainNotFound,
    );
  });

  it('should throw DomainNotFound if event does not exist', async () => {
    const agendaId = 1;
    const eventId = 1;
    const mockAgenda = { id: agendaId } as Agenda;

    agendaProvider.findById.mockResolvedValueOnce(mockAgenda);
    agendaEventProvider.findById.mockResolvedValueOnce(undefined);

    await expect(useCase.execute(eventId, agendaId)).rejects.toThrow(
      DomainNotFound,
    );
  });

  it('should throw DomainInternalServerError if event cancellation fails', async () => {
    const agendaId = 1;
    const eventId = 1;
    const mockAgenda = { id: agendaId } as Agenda;
    const mockEvent = { id: eventId } as AgendaEvent;

    agendaProvider.findById.mockResolvedValueOnce(mockAgenda);
    agendaEventProvider.findById.mockResolvedValueOnce(mockEvent);
    agendaEventProvider.softDelete.mockResolvedValueOnce({
      affected: 0,
      raw: [],
    });

    await expect(useCase.execute(eventId, agendaId)).rejects.toThrow(
      DomainInternalServerError,
    );
  });

  it('should return the agenda if event is canceled successfully', async () => {
    const agendaId = 1;
    const eventId = 1;
    const mockAgenda = { id: agendaId, artistId: 1 } as Agenda;
    const mockEvent = { id: eventId, customerId: 1 } as AgendaEvent;

    agendaProvider.findById.mockResolvedValueOnce(mockAgenda);
    agendaEventProvider.findById.mockResolvedValueOnce(mockEvent);
    agendaEventProvider.softDelete.mockResolvedValueOnce({
      affected: 1,
      raw: [],
    });

    const result = await useCase.execute(eventId, agendaId);

    expect(result).toBe(mockAgenda);
  });

  it('should publish an event cancellation message to the notification queue', async () => {
    const agendaId = 1;
    const eventId = 1;
    const mockAgenda = { id: agendaId, artistId: 1 } as Agenda;
    const mockEvent = { id: eventId, customerId: 1 } as AgendaEvent;
    const queueMessage: AgendaEventCanceledJobType = {
      jobId: 'EVENT_CANCELED',
      metadata: {
        eventId: mockEvent.id,
        artistId: mockAgenda.artistId,
        customerId: mockEvent.customerId,
      },
      notificationTypeId: 'EMAIL',
    };

    agendaProvider.findById.mockResolvedValueOnce(mockAgenda);
    agendaEventProvider.findById.mockResolvedValueOnce(mockEvent);
    agendaEventProvider.softDelete.mockResolvedValueOnce({
      affected: 1,
      raw: [],
    });

    await useCase.execute(eventId, agendaId);

    expect(notificationQueue.add).toHaveBeenCalledWith(queueMessage);
  });
});
