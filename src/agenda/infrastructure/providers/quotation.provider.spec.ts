import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AGENDA_DB_CONNECTION_NAME } from '../../../databases/constants';
import { Quotation, QuotationStatus } from '../entities/quotation.entity';
import { QuotationHistory } from '../entities/quotationHistory.entity';

import { QuotationProvider } from './quotation.provider';

describe('QuotationProvider', () => {
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
          logging: true,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forFeature(
          [Quotation, QuotationHistory],
          AGENDA_DB_CONNECTION_NAME,
        ),
      ],
      providers: [
        {
          provide: getRepositoryToken(Quotation),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(QuotationHistory),
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

  describe('Quotation Lifecycle', () => {
    let pendingQuotation: Quotation;
    const customerUserId = 1;
    const artistUserId = 2;

    beforeEach(async () => {
      pendingQuotation = await quotationProvider.repo.save({
        status: 'pending',
        artistId: 1,
        customerId: 1,
        description: 'Test tattoo quotation',
      } as Partial<Quotation>);
    });

    describe('Early Cancellation', () => {
      it('should allow customer to cancel a pending quotation', async () => {
        const { transactionIsOK, updatedQuotation } =
          await quotationProvider.updateQuotationState(
            pendingQuotation.id,
            customerUserId,
            'customer',
            {
              action: 'cancel',
              cancelReason: 'change_of_mind',
              additionalDetails: 'Changed my mind',
            },
            'canceled' as QuotationStatus,
          );

        expect(transactionIsOK).toBe(true);
        expect(updatedQuotation.status).toBe('canceled');
        expect(updatedQuotation.canceledBy).toBe('customer');
        expect(updatedQuotation.customerCancelReason).toBe('change_of_mind');

        const history = await quotationProvider.manager.findOne(
          QuotationHistory,
          {
            where: { quotation: { id: pendingQuotation.id } },
          },
        );
        expect(history.previousStatus).toBe('pending');
        expect(history.newStatus).toBe('canceled');
        expect(history.changedByUserType).toBe('customer');
      });

      it('should allow system to cancel a pending quotation due to timeout', async () => {
        const { transactionIsOK, updatedQuotation } =
          await quotationProvider.updateQuotationState(
            pendingQuotation.id,
            0, // system userId
            'system',
            {
              action: 'cancel',
              cancelReason: 'system_timeout',
              additionalDetails: 'No response from artist',
            },
            'canceled' as QuotationStatus,
          );

        expect(transactionIsOK).toBe(true);
        expect(updatedQuotation.status).toBe('canceled');
        expect(updatedQuotation.canceledBy).toBe('system');
        expect(updatedQuotation.systemCancelReason).toBe('system_timeout');

        const history = await quotationProvider.manager.findOne(
          QuotationHistory,
          {
            where: { quotation: { id: pendingQuotation.id } },
          },
        );
        expect(history.previousStatus).toBe('pending');
        expect(history.newStatus).toBe('canceled');
        expect(history.changedByUserType).toBe('system');
      });
    });

    describe('Artist Review', () => {
      it('should allow artist to reject a pending quotation', async () => {
        const { transactionIsOK, updatedQuotation } =
          await quotationProvider.updateQuotationState(
            pendingQuotation.id,
            artistUserId,
            'artist',
            {
              action: 'reject',
              rejectionReason: 'scheduling_conflict',
              additionalDetails: 'Fully booked',
            },
            'rejected' as QuotationStatus,
          );

        expect(transactionIsOK).toBe(true);
        expect(updatedQuotation.status).toBe('rejected');
        expect(updatedQuotation.artistRejectReason).toBe('scheduling_conflict');

        const history = await quotationProvider.manager.findOne(
          QuotationHistory,
          {
            where: { quotation: { id: pendingQuotation.id } },
          },
        );
        expect(history.previousStatus).toBe('pending');
        expect(history.newStatus).toBe('rejected');
        expect(history.changedByUserType).toBe('artist');
      });

      it('should allow artist to quote a pending quotation', async () => {
        const date = new Date('2023-12-01');
        const { transactionIsOK, updatedQuotation } =
          await quotationProvider.updateQuotationState(
            pendingQuotation.id,
            artistUserId,
            'artist',
            {
              action: 'quote',
              estimatedCost: 200,
              appointmentDate: date,
              appointmentDuration: 120,
              additionalDetails: 'Available for the requested date',
            },
            'quoted' as QuotationStatus,
          );

        expect(transactionIsOK).toBe(true);
        expect(updatedQuotation.status).toBe('quoted');
        expect(updatedQuotation.estimatedCost).toBe(200);
        // expect(updatedQuotation.appointmentDate).toEqual(date);
        expect(updatedQuotation.appointmentDuration).toBe(120);

        const history = await quotationProvider.manager.findOne(
          QuotationHistory,
          {
            where: { quotation: { id: pendingQuotation.id } },
          },
        );
        expect(history.previousStatus).toBe('pending');
        expect(history.newStatus).toBe('quoted');
        expect(history.changedByUserType).toBe('artist');
      });
    });

    describe('Customer Response to Quote', () => {
      let quotedQuotation: Quotation;

      beforeEach(async () => {
        const { updatedQuotation } =
          await quotationProvider.updateQuotationState(
            pendingQuotation.id,
            artistUserId,
            'artist',
            {
              action: 'quote',
              estimatedCost: 200,
              appointmentDate: new Date('2023-12-01'),
              appointmentDuration: 120,
            },
            'quoted' as QuotationStatus,
          );
        quotedQuotation = updatedQuotation;
      });

      it('should allow customer to reject a quoted quotation', async () => {
        const { transactionIsOK, updatedQuotation } =
          await quotationProvider.updateQuotationState(
            quotedQuotation.id,
            customerUserId,
            'customer',
            {
              action: 'reject',
              rejectionReason: 'too_expensive',
              additionalDetails: 'The price is too high',
            },
            'rejected' as QuotationStatus,
          );

        expect(transactionIsOK).toBe(true);
        expect(updatedQuotation.status).toBe('rejected');
        expect(updatedQuotation.customerRejectReason).toBe('too_expensive');

        const history = await quotationProvider.manager.findOne(
          QuotationHistory,
          {
            where: { quotation: { id: quotedQuotation.id } },
            order: { createdAt: 'DESC' },
          },
        );
        expect(history.previousStatus).toBe('quoted');
        expect(history.newStatus).toBe('rejected');
        expect(history.changedByUserType).toBe('customer');
      });

      it('should allow customer to accept a quoted quotation', async () => {
        const { transactionIsOK, updatedQuotation } =
          await quotationProvider.updateQuotationState(
            quotedQuotation.id,
            customerUserId,
            'customer',
            { action: 'accept', additionalDetails: 'Looks good, I accept' },
            'accepted' as QuotationStatus,
          );

        expect(transactionIsOK).toBe(true);
        expect(updatedQuotation.status).toBe('accepted');

        const history = await quotationProvider.manager.findOne(
          QuotationHistory,
          {
            where: { quotation: { id: quotedQuotation.id } },
            order: { createdAt: 'DESC' },
          },
        );
        expect(history.previousStatus).toBe('quoted');
        expect(history.newStatus).toBe('accepted');
        expect(history.changedByUserType).toBe('customer');
      });

      it('should allow customer to appeal a quoted quotation', async () => {
        const { transactionIsOK, updatedQuotation } =
          await quotationProvider.updateQuotationState(
            quotedQuotation.id,
            customerUserId,
            'customer',
            {
              action: 'appeal',
              appealReason: 'price_change',
              additionalDetails: 'Can we negotiate the price?',
            },
            'appealed' as QuotationStatus,
          );

        expect(transactionIsOK).toBe(true);
        expect(updatedQuotation.status).toBe('appealed');
        expect(updatedQuotation.appealedReason).toBe('price_change');

        const history = await quotationProvider.manager.findOne(
          QuotationHistory,
          {
            where: { quotation: { id: quotedQuotation.id } },
            order: { createdAt: 'DESC' },
          },
        );
        expect(history.previousStatus).toBe('quoted');
        expect(history.newStatus).toBe('appealed');
        expect(history.changedByUserType).toBe('customer');
      });
    });

    describe('Artist Response to Appeal', () => {
      let appealedQuotation: Quotation;

      beforeEach(async () => {
        const { updatedQuotation } =
          await quotationProvider.updateQuotationState(
            pendingQuotation.id,
            pendingQuotation.artistId,
            'artist',
            {
              action: 'quote',
              estimatedCost: 200,
              appointmentDate: new Date('2023-12-01'),
              appointmentDuration: 120,
            },
            'quoted' as QuotationStatus,
          );
        const { updatedQuotation: appealed } =
          await quotationProvider.updateQuotationState(
            updatedQuotation.id,
            updatedQuotation.customerId,
            'customer',
            {
              action: 'appeal',
              appealReason: 'price_change',
              additionalDetails: 'Can we negotiate the price?',
            },
            'appealed' as QuotationStatus,
          );
        appealedQuotation = appealed;
      });

      it('should allow artist to reject an appealed quotation', async () => {
        const { transactionIsOK, updatedQuotation } =
          await quotationProvider.updateQuotationState(
            appealedQuotation.id,
            artistUserId,
            'artist',
            {
              action: 'reject_appeal',
              rejectionReason: 'artistic_disagreement',
              additionalDetails: 'Sorry, the price is firm',
            },
            'rejected' as QuotationStatus,
          );

        expect(transactionIsOK).toBe(true);
        expect(updatedQuotation.status).toBe('rejected');
        expect(updatedQuotation.artistRejectReason).toBe(
          'artistic_disagreement',
        );

        const history = await quotationProvider.manager.findOne(
          QuotationHistory,
          {
            where: { quotation: { id: appealedQuotation.id } },
            order: { createdAt: 'DESC' },
          },
        );
        expect(history.previousStatus).toBe('appealed');
        expect(history.newStatus).toBe('rejected');
        expect(history.changedByUserType).toBe('artist');
      });

      it('should allow artist to accept an appealed quotation and update it', async () => {
        const { transactionIsOK, updatedQuotation } =
          await quotationProvider.updateQuotationState(
            appealedQuotation.id,
            artistUserId,
            'artist',
            {
              action: 'accept_appeal',
              estimatedCost: 180,
              appointmentDate: new Date('2023-12-05'),
              appointmentDuration: 90,
              additionalDetails:
                'I can offer a slight discount and adjust the appointment',
            },
            'quoted' as QuotationStatus,
          );

        expect(transactionIsOK).toBe(true);
        expect(updatedQuotation.status).toBe('quoted');
        expect(updatedQuotation.estimatedCost).toBe(180);
        // expect(updatedQuotation.appointmentDate).toEqual(
        //   new Date('2023-12-05'),
        // );
        expect(updatedQuotation.appointmentDuration).toBe(90);

        const history = await quotationProvider.manager.findOne(
          QuotationHistory,
          {
            where: { quotation: { id: appealedQuotation.id } },
            order: { createdAt: 'DESC' },
          },
        );
        expect(history.previousStatus).toBe('appealed');
        expect(history.newStatus).toBe('quoted');
        expect(history.changedByUserType).toBe('artist');
      });
    });
  });
});
