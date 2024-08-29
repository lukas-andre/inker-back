import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import {
  QuotationArtistRejectDto,
  QuotationEarlyCancelDto,
} from '../dtos/quotations.dto';
import { Quotation } from '../entities/quotation.entity';
import { QuotationHistory } from '../entities/quotationHistory.entity';

import { QuotationProvider } from './quotation.provider';

describe('QuotationProvider', () => {
  const quotationToken = getRepositoryToken(Quotation);
  const quotationHistoryToken = getRepositoryToken(QuotationHistory);

  let quotationProvider: QuotationProvider;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: 'inker-test',
          host: process.env.DB_HOST || '0.0.0.0',
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || 'root',
          port: parseInt(process.env.DB_PORT, 10),
          name: AGENDA_DB_CONNECTION_NAME,
          entities: [Quotation, QuotationHistory],
          synchronize: true,
          dropSchema: true,
          logging: false,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forFeature(
          [Quotation, QuotationHistory],
          AGENDA_DB_CONNECTION_NAME,
        ),
      ],
      providers: [
        {
          provide: quotationToken,
          useClass: Repository,
        },
        {
          provide: quotationHistoryToken,
          useClass: Repository,
        },
        QuotationProvider,
      ],
    }).compile();

    quotationProvider = moduleFixture.get<QuotationProvider>(QuotationProvider);
  });

  afterAll(async () => {
    await quotationProvider.repo.query(
      'DROP TABLE IF EXISTS quotation CASCADE',
    );
    await quotationProvider.repo.query(
      'DROP TABLE IF EXISTS quotation_history CASCADE',
    );
    await moduleFixture.close();
  });

  it('quotationProvider should be defined', () => {
    expect(quotationProvider).toBeDefined();
  });

  it('quotationProvider.repo should be defined as Repository', () => {
    expect(quotationProvider.repo).toBeDefined();
    expect(quotationProvider.repo).toBeInstanceOf(Repository);
  });

  it('quotationProvider.source should be defined as DataSource', () => {
    expect(quotationProvider.source).toBeDefined();
    expect(quotationProvider.source).toBeInstanceOf(DataSource);
  });

  it('quotationProvider.manager should be defined as EntityManager', () => {
    expect(quotationProvider.manager).toBeDefined();
    expect(quotationProvider.manager).toBeInstanceOf(EntityManager);
  });

  it('quotation table should be created', async () => {
    const quotation = await quotationProvider.repo.save({
      status: 'pending',
      artistId: 1,
      customerId: 1,
      description: 'a new tattoo',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Partial<Quotation>);

    expect(quotation).toBeDefined();
    expect(quotation.id).toBeDefined();
    expect(quotation.status).toBe('pending');
    expect(quotation.artistId).toBe(1);
    expect(quotation.customerId).toBe(1);
    expect(quotation.createdAt).toBeDefined();
    expect(quotation.updatedAt).toBeDefined();
  });

  it('quotationProvider.exists should return true for existing quotation', async () => {
    const quotation = await quotationProvider.repo.save({
      status: 'pending',
      artistId: 1,
      customerId: 1,
      description: 'a new tattoo[exists]',
    } as Partial<Quotation>);

    const exists = await quotationProvider.exists(quotation.id);
    expect(exists).toBe(true);
  });

  it('quotationProvider.exists should return false for non-existing quotation', async () => {
    const exists = await quotationProvider.exists(999);
    expect(exists).toBe(false);
  });

  it('quotationProvider.findById should return the correct quotation', async () => {
    const savedQuotation = await quotationProvider.repo.save({
      status: 'pending',
      artistId: 1,
      customerId: 1,
      description: 'a new tattoo[findById]',
    } as Partial<Quotation>);

    const quotation = await quotationProvider.findById(savedQuotation.id);
    expect(quotation).toBeDefined();
    expect(quotation.id).toBe(savedQuotation.id);
  });

  it('quotationProvider.updateStatus should update the quotation status', async () => {
    const savedQuotation = await quotationProvider.repo.save({
      status: 'pending',
      artistId: 1,
      customerId: 1,
      description: 'a new tattoo[updateStatus]',
    } as Partial<Quotation>);

    await quotationProvider.updateStatus(savedQuotation.id, 'accepted');
    const updatedQuotation = await quotationProvider.findById(
      savedQuotation.id,
    );
    expect(updatedQuotation.status).toBe('accepted');
  });

  it('quotationProvider.artistRejectQuotationTransaction should reject the quotation and create history', async () => {
    const savedQuotation = await quotationProvider.repo.save({
      status: 'pending',
      artistId: 1,
      customerId: 1,
      description: 'a new tattoo[artistRejectQuotationTransaction]',
    } as Partial<Quotation>);

    const dto: QuotationArtistRejectDto = {
      reason: 'scheduling_conflict',
      rejectReasonDetails: 'Fully booked for the requested date',
    };

    const { transactionIsOK, updatedQuotation } =
      await quotationProvider.artistRejectQuotationTransaction(
        savedQuotation.id,
        2,
        dto,
      );

    expect(transactionIsOK).toBe(true);
    expect(updatedQuotation).toBeDefined();
    expect(updatedQuotation.status).toBe('rejected');
    expect(updatedQuotation.rejectBy).toBe('artist');
    expect(updatedQuotation.artistRejectReason).toBe(dto.reason);
    expect(updatedQuotation.rejectReasonDetails).toBe(dto.rejectReasonDetails);

    // Check if history was created
    const history = await quotationProvider.manager.findOne(QuotationHistory, {
      where: { quotation: { id: savedQuotation.id } },
    });

    expect(history).toBeDefined();
    expect(history.previousStatus).toBe('pending');
    expect(history.newStatus).toBe('rejected');
    expect(history.changedByUserType).toBe('artist');
    expect(history.rejectionReason).toBe(dto.reason);
    expect(history.additionalDetails).toBe(dto.rejectReasonDetails);
  });

  it('quotationProvider.earlyCancelQuotationTransaction should cancel the quotation and create history', async () => {
    const savedQuotation = await quotationProvider.repo.save({
      status: 'pending',
      artistId: 1,
      customerId: 1,
      description: 'a new tattoo[earlyCancelQuotationTransaction]',
    } as Partial<Quotation>);

    const dto: QuotationEarlyCancelDto = {
      reason: 'change_of_mind',
      cancelReasonDetails: 'No longer available for the requested service',
    };

    const { transactionIsOK, updatedQuotation } =
      await quotationProvider.earlyCancelQuotationTransaction(
        savedQuotation.id,
        1,
        dto,
      );

    expect(transactionIsOK).toBe(true);
    expect(updatedQuotation).toBeDefined();
    expect(updatedQuotation.status).toBe('canceled');
    expect(updatedQuotation.canceledBy).toBe('customer');
    expect(updatedQuotation.customerCancelReason).toBe(dto.reason);
    expect(updatedQuotation.cancelReasonDetails).toBe(dto.cancelReasonDetails);

    // Check if history was created
    const history = await quotationProvider.manager.findOne(QuotationHistory, {
      where: { quotation: { id: savedQuotation.id } },
    });

    expect(history).toBeDefined();
    expect(history.previousStatus).toBe('pending');
    expect(history.newStatus).toBe('canceled');
    expect(history.changedByUserType).toBe('customer');
    expect(history.cancellationReason).toBe(dto.reason);
    expect(history.additionalDetails).toBe(dto.cancelReasonDetails);
  });
});
