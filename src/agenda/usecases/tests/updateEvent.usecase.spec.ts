import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';

import {
  DomainConflict,
  DomainNotFound,
} from '../../../global/domain/exceptions/domain.exception';
import { AgendaEventUpdatedJobType } from '../../../queues/notifications/domain/schemas/agenda';
import { queues } from '../../../queues/queues';
import { UpdateEventReqDto } from '../../infrastructure/dtos/updateEventReq.dto';
import { Agenda } from '../../infrastructure/entities/agenda.entity';
import { AgendaEvent } from '../../infrastructure/entities/agendaEvent.entity';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { UpdateEventUseCase } from '../event/updateEvent.usecase';

describe('UpdateEventUseCase', () => {
  let useCase: UpdateEventUseCase;
  let agendaProvider: DeepMocked<AgendaRepository>;
  let agendaEventProvider: DeepMocked<AgendaEventRepository>;
  let notificationQueue: DeepMocked<Queue>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEventUseCase,
        {
          provide: AgendaRepository,
          useValue: createMock<AgendaRepository>(),
        },
        {
          provide: AgendaEventRepository,
          useValue: createMock<AgendaEventRepository>(),
        },
        {
          provide: getQueueToken(queues.notification.name),
          useValue: createMock<Queue>(),
        },
      ],
    }).compile();

    useCase = module.get<UpdateEventUseCase>(UpdateEventUseCase);
    agendaProvider = module.get(AgendaRepository);
    agendaEventProvider = module.get(AgendaEventRepository);
    notificationQueue = module.get(getQueueToken(queues.notification.name));
  });

  it('should throw DomainNotFound if agenda does not exist', async () => {
    const dto: UpdateEventReqDto = {
      agendaId: 1,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      title: 'New Title',
      info: 'Updated Info',
      color: 'blue',
      notification: true,
    };
    const eventId = 1;

    agendaProvider.findById.mockResolvedValueOnce(undefined);

    await expect(useCase.execute(dto, eventId)).rejects.toThrow(DomainNotFound);
  });

  it('should throw DomainNotFound if event does not exist', async () => {
    const dto: UpdateEventReqDto = {
      agendaId: 1,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      title: 'New Title',
      info: 'Updated Info',
      color: 'blue',
      notification: true,
    };
    const eventId = 1;
    const mockAgenda = { id: 1 } as Agenda;

    agendaProvider.findById.mockResolvedValueOnce(mockAgenda);
    agendaEventProvider.findById.mockResolvedValueOnce(undefined);

    await expect(useCase.execute(dto, eventId)).rejects.toThrow(DomainNotFound);
  });

  it('should throw DomainConflict if date range is in use', async () => {
    const dto: UpdateEventReqDto = {
      agendaId: 1,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      title: 'New Title',
      info: 'Updated Info',
      color: 'blue',
      notification: true,
    };
    const eventId = 1;
    const mockAgenda = { id: 1 } as Agenda;
    const mockEvent = { id: eventId } as AgendaEvent;

    agendaProvider.findById.mockResolvedValueOnce(mockAgenda);
    agendaEventProvider.findById.mockResolvedValueOnce(mockEvent);
    agendaEventProvider.existEventBetweenStartDateAndEndDate.mockResolvedValueOnce(
      true,
    );

    await expect(useCase.execute(dto, eventId)).rejects.toThrow(DomainConflict);
  });

  it('should update the event successfully if no conflicts', async () => {
    const dto: UpdateEventReqDto = {
      agendaId: 1,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      title: 'New Title',
      info: 'Updated Info',
      color: 'blue',
      notification: true,
    };
    const eventId = 1;
    const mockAgenda = { id: 1, artistId: 1 } as Agenda;
    const mockEvent = { id: eventId, customerId: 1 } as AgendaEvent;

    agendaProvider.findById.mockResolvedValueOnce(mockAgenda);
    agendaEventProvider.findById.mockResolvedValueOnce(mockEvent);
    agendaEventProvider.existEventBetweenStartDateAndEndDate.mockResolvedValueOnce(
      false,
    );
    agendaEventProvider.createEventHistoryWithNativeQuery.mockResolvedValueOnce(
      undefined,
    );
    agendaEventProvider.save.mockResolvedValueOnce(mockEvent);

    const result = await useCase.execute(dto, eventId);

    expect(result).toBe(mockEvent);
    expect(agendaEventProvider.save).toHaveBeenCalledWith({
      ...mockEvent,
      title: dto.title,
      info: dto.info,
      color: dto.color,
      start: new Date(dto.start),
      end: new Date(dto.end),
      notification: dto.notification,
    });
  });

  it('should publish an event update message to the notification queue', async () => {
    const dto: UpdateEventReqDto = {
      agendaId: 1,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      title: 'New Title',
      info: 'Updated Info',
      color: 'blue',
      notification: true,
    };
    const eventId = 1;
    const mockAgenda = { id: 1, artistId: 1 } as Agenda;
    const mockEvent = { id: eventId, customerId: 1 } as AgendaEvent;
    const queueMessage: AgendaEventUpdatedJobType = {
      jobId: 'EVENT_UPDATED',
      metadata: {
        eventId: mockEvent.id,
        artistId: mockAgenda.artistId,
        customerId: mockEvent.customerId,
      },
      notificationTypeId: 'EMAIL',
    };

    agendaProvider.findById.mockResolvedValueOnce(mockAgenda);
    agendaEventProvider.findById.mockResolvedValueOnce(mockEvent);
    agendaEventProvider.existEventBetweenStartDateAndEndDate.mockResolvedValueOnce(
      false,
    );
    agendaEventProvider.createEventHistoryWithNativeQuery.mockResolvedValueOnce(
      undefined,
    );
    agendaEventProvider.save.mockResolvedValueOnce(mockEvent);

    await useCase.execute(dto, eventId);

    expect(notificationQueue.add).toHaveBeenCalledWith(queueMessage);
  });
});
