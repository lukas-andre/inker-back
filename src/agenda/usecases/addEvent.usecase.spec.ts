import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { CustomerProvider } from '../../customers/infrastructure/providers/customer.provider';
import {
  DomainBadRule,
  DomainNotFound,
} from '../../global/domain/exceptions/domain.exception';
import { AddEventReqDto } from '../infrastructure/dtos/addEventReq.dto';
import { AgendaEvent } from '../infrastructure/entities/agendaEvent.entity';
import { AgendaProvider } from '../infrastructure/providers/agenda.provider';
import { AgendaEventProvider } from '../infrastructure/providers/agendaEvent.provider';

import { AddEventUseCase } from './addEvent.usecase';

describe('AddEventUseCase', () => {
  let useCase: AddEventUseCase;
  let agendaProvider: DeepMocked<AgendaProvider>;
  let agendaEventProvider: DeepMocked<AgendaEventProvider>;
  let customerProvider: DeepMocked<CustomerProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddEventUseCase,
        {
          provide: AgendaProvider,
          useValue: createMock<AgendaProvider>(),
        },
        {
          provide: AgendaEventProvider,
          useValue: createMock<AgendaEventProvider>(),
        },
        {
          provide: CustomerProvider,
          useValue: createMock<CustomerProvider>(),
        },
      ],
    }).compile();

    useCase = module.get<AddEventUseCase>(AddEventUseCase);
    agendaProvider = module.get(AgendaProvider);
    agendaEventProvider = module.get(AgendaEventProvider);
    customerProvider = module.get(CustomerProvider);
  });

  it('should throw DomainNotFound if agenda does not exist', async () => {
    const dto = {
      color: 'red',
      title: 'title',
      info: 'info',
      notification: false,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      agendaId: 1,
      customerId: 1,
    } as AddEventReqDto;

    agendaProvider.findById.mockResolvedValueOnce(undefined);

    await expect(useCase.execute(dto)).rejects.toThrow(DomainNotFound);
  });

  it('should throw DomainNotFound if customer does not exist', async () => {
    const dto = {
      color: 'red',
      title: 'title',
      info: 'info',
      notification: false,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      agendaId: 1,
      customerId: 1,
    } as AddEventReqDto;
    const mockAgenda = { id: 1 };

    agendaProvider.findById.mockResolvedValueOnce(mockAgenda as any);
    customerProvider.findById.mockResolvedValueOnce(undefined);

    await expect(useCase.execute(dto)).rejects.toThrow(DomainNotFound);
  });

  it('should throw DomainBadRule if date range is in use', async () => {
    const dto = {
      color: 'red',
      title: 'title',
      info: 'info',
      notification: false,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      agendaId: 1,
      customerId: 1,
    } as AddEventReqDto;
    const mockAgenda = { id: 1 };
    const mockCustomer = { id: 1 };

    agendaProvider.findById.mockResolvedValueOnce(mockAgenda as any);
    customerProvider.findById.mockResolvedValueOnce(mockCustomer as any);
    agendaEventProvider.existEventBetweenStartDateAndEndDate.mockResolvedValueOnce(
      true,
    );

    await expect(useCase.execute(dto)).rejects.toThrow(DomainBadRule);
  });

  describe('when adding an event', () => {
    const dto = {
      color: 'red',
      title: 'title',
      info: 'info',
      notification: false,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      agendaId: 1,
      customerId: 1,
    } as AddEventReqDto;
    const mockAgenda = { id: 1 };
    const mockCustomer = { id: 1 };

    beforeEach(() => {
      agendaProvider.findById.mockResolvedValueOnce(mockAgenda as any);
      customerProvider.findById.mockResolvedValueOnce(mockCustomer as any);
      agendaEventProvider.existEventBetweenStartDateAndEndDate.mockResolvedValueOnce(
        false,
      );
    });

    it('should throw DomainBadRule if transaction fails', async () => {
      agendaProvider.createEventAndInvitationTransaction.mockResolvedValueOnce(
        false,
      );

      await expect(useCase.execute(dto)).rejects.toThrow(DomainBadRule);
    });

    it('should return the event if transaction is successful', async () => {
      agendaProvider.createEventAndInvitationTransaction.mockResolvedValueOnce(
        true,
      );

      const result = await useCase.execute(dto);

      expect(result).not.toBeDefined();
    });
  });
});
