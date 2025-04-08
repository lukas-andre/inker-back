import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { CustomerRepository } from '../../../customers/infrastructure/providers/customer.repository';
import {
  DomainBadRule,
  DomainNotFound,
} from '../../../global/domain/exceptions/domain.exception';
import { AddEventReqDto } from '../../infrastructure/dtos/addEventReq.dto';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { AddEventUseCase } from '../addEvent.usecase';

describe('AddEventUseCase', () => {
  let useCase: AddEventUseCase;
  let agendaProvider: DeepMocked<AgendaRepository>;
  let agendaEventProvider: DeepMocked<AgendaEventRepository>;
  let customerProvider: DeepMocked<CustomerRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddEventUseCase,
        {
          provide: AgendaRepository,
          useValue: createMock<AgendaRepository>(),
        },
        {
          provide: AgendaEventRepository,
          useValue: createMock<AgendaEventRepository>(),
        },
        {
          provide: CustomerRepository,
          useValue: createMock<CustomerRepository>(),
        },
      ],
    }).compile();

    useCase = module.get<AddEventUseCase>(AddEventUseCase);
    agendaProvider = module.get(AgendaRepository);
    agendaEventProvider = module.get(AgendaEventRepository);
    customerProvider = module.get(CustomerRepository);
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
      agendaProvider.createEventAndInvitationTransaction.mockResolvedValueOnce({
        transactionIsOK: true,
        eventId: 1,
      });

      await expect(useCase.execute(dto)).rejects.toThrow(DomainBadRule);
    });

    it('should return the event if transaction is successful', async () => {
      agendaProvider.createEventAndInvitationTransaction.mockResolvedValueOnce({
        transactionIsOK: true,
        eventId: 1,
      });

      const result = await useCase.execute(dto);

      expect(result).not.toBeDefined();
    });
  });
});
