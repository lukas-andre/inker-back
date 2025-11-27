import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Between, In, IsNull } from 'typeorm';
import { GetSchedulerViewUseCase } from './getSchedulerView.usecase';
import { AgendaRepository } from '../../infrastructure/repositories/agenda.repository';
import { AgendaEventRepository } from '../../infrastructure/repositories/agendaEvent.repository';
import { QuotationRepository } from '../../infrastructure/repositories/quotation.provider';
import { SchedulingService } from '../../services/scheduling.service';
import { EventActionEngineService } from '../../domain/services/eventActionEngine.service';
import { CustomerRepository } from '../../../customers/infrastructure/providers/customer.repository';
import { GetSchedulerViewQueryDto } from '../../infrastructure/dtos/getSchedulerViewQuery.dto';
import { AgendaEventStatus } from '../../domain/enum/agendaEventStatus.enum';
import { QuotationType, QuotationStatus } from '../../infrastructure/entities/quotation.entity';
import { UserType } from '../../../users/domain/enums/userType.enum';

describe('GetSchedulerViewUseCase', () => {
  let useCase: GetSchedulerViewUseCase;
  let agendaRepository: jest.Mocked<AgendaRepository>;
  let agendaEventRepository: jest.Mocked<AgendaEventRepository>;
  let quotationProvider: jest.Mocked<QuotationRepository>;
  let schedulingService: jest.Mocked<SchedulingService>;
  let eventActionEngineService: jest.Mocked<EventActionEngineService>;
  let customerRepository: jest.Mocked<CustomerRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSchedulerViewUseCase,
        {
          provide: AgendaRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: AgendaEventRepository,
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: QuotationRepository,
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: SchedulingService,
          useValue: {
            findAvailableSlots: jest.fn(),
            suggestOptimalTimes: jest.fn(),
          },
        },
        {
          provide: EventActionEngineService,
          useValue: {
            getAvailableActions: jest.fn(),
          },
        },
        {
          provide: CustomerRepository,
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetSchedulerViewUseCase>(GetSchedulerViewUseCase);
    agendaRepository = module.get(AgendaRepository);
    agendaEventRepository = module.get(AgendaEventRepository);
    quotationProvider = module.get(QuotationRepository);
    schedulingService = module.get(SchedulingService);
    eventActionEngineService = module.get(EventActionEngineService);
    customerRepository = module.get(CustomerRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const artistId = 'artist-123';
    const query: GetSchedulerViewQueryDto = {
      fromDate: '2024-01-15T00:00:00Z',
      toDate: '2024-01-22T00:00:00Z',
      includeAvailability: false,
      includeSuggestions: false,
      defaultDuration: 60,
    };

    it('should throw NotFoundException when artist does not have an agenda', async () => {
      agendaRepository.findOne.mockResolvedValue(null);

      await expect(useCase.execute(artistId, query)).rejects.toThrow(
        new NotFoundException(`Artist ${artistId} does not have an agenda`),
      );
    });

    it('should return scheduler view data when artist has an agenda', async () => {
      const mockAgenda = {
        id: 'agenda-123',
        artistId,
        workingHoursStart: '09:00',
        workingHoursEnd: '18:00',
        workingDays: ['1', '2', '3', '4', '5'],
      };

      const mockEvents = [
        {
          id: 'event-123',
          title: 'Test Event',
          info: 'Test description',
          startDate: new Date('2024-01-15T14:00:00Z'),
          endDate: new Date('2024-01-15T16:00:00Z'),
          status: AgendaEventStatus.CONFIRMED,
          customerId: 'customer-123',
          agenda: mockAgenda,
        },
      ];

      const mockQuotations = [
        {
          id: 'quotation-123',
          type: QuotationType.DIRECT,
          status: QuotationStatus.QUOTED,
          artistId,
          customerId: 'customer-456',
          description: 'Test quotation',
          appointmentDate: new Date('2024-01-16T10:00:00Z'),
          appointmentDuration: 60,
        },
      ];

      const mockCustomers = [
        {
          id: 'customer-123',
          firstName: 'John',
          lastName: 'Doe',
          profileThumbnail: 'avatar-url',
        },
        {
          id: 'customer-456',
          firstName: 'Jane',
          lastName: 'Smith',
          profileThumbnail: null,
        },
      ];

      const mockActions = {
        canEdit: true,
        canCancel: true,
        canReschedule: true,
      };

      agendaRepository.findOne.mockResolvedValue(mockAgenda as any);
      agendaEventRepository.find.mockResolvedValue(mockEvents as any);
      quotationProvider.find.mockResolvedValueOnce(mockQuotations as any);
      quotationProvider.find.mockResolvedValueOnce([]); // Empty open quotations
      customerRepository.find.mockResolvedValue(mockCustomers as any);
      eventActionEngineService.getAvailableActions.mockResolvedValue(mockActions as any);

      const result = await useCase.execute(artistId, query);

      expect(result).toBeDefined();
      expect(result.events).toHaveLength(1);
      expect(result.quotations).toHaveLength(1);
      expect(result.workingHours).toEqual({
        start: '09:00',
        end: '18:00',
        workingDays: ['1', '2', '3', '4', '5'],
      });
      expect(result.summary.totalConfirmedEvents).toBe(1);
      expect(result.summary.totalActionableQuotations).toBe(1);
    });

    it('should include availability when requested', async () => {
      const queryWithAvailability = { ...query, includeAvailability: true };
      const mockAgenda = {
        id: 'agenda-123',
        artistId,
        workingHoursStart: '09:00',
        workingHoursEnd: '18:00',
        workingDays: ['1', '2', '3', '4', '5'],
      };

      const mockAvailability = [
        {
          date: '2024-01-15',
          slots: [
            {
              startTime: new Date('2024-01-15T09:00:00Z'),
              endTime: new Date('2024-01-15T10:00:00Z'),
              density: 0.5,
            },
          ],
        },
      ];

      agendaRepository.findOne.mockResolvedValue(mockAgenda as any);
      agendaEventRepository.find.mockResolvedValue([]);
      quotationProvider.find.mockResolvedValue([]);
      customerRepository.find.mockResolvedValue([]);
      schedulingService.findAvailableSlots.mockResolvedValue(mockAvailability);

      const result = await useCase.execute(artistId, queryWithAvailability);

      expect(result.availability).toEqual(mockAvailability);
      expect(schedulingService.findAvailableSlots).toHaveBeenCalledWith(
        artistId,
        query.defaultDuration,
        new Date(query.fromDate),
        new Date(query.toDate),
      );
    });
  });
});