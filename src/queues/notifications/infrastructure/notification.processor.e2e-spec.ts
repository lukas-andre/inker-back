import { BullModule, getQueueToken } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Job, Queue } from 'bull';
import { DataSource, Repository } from 'typeorm';

import { Agenda } from '../../../agenda/infrastructure/entities/agenda.entity';
import { AgendaEvent } from '../../../agenda/infrastructure/entities/agendaEvent.entity';
import { AgendaInvitation } from '../../../agenda/infrastructure/entities/agendaInvitation.entity';
import { AgendaProvider } from '../../../agenda/infrastructure/providers/agenda.provider';
import { AgendaEventProvider } from '../../../agenda/infrastructure/providers/agendaEvent.provider';
import { ArtistProvider } from '../../../artists/infrastructure/database/artist.provider';
import { Artist } from '../../../artists/infrastructure/entities/artist.entity';
import { Contact } from '../../../artists/infrastructure/entities/contact.entity';
import { sendGridConfig } from '../../../config/sendgrid.config';
import { Customer } from '../../../customers/infrastructure/entities/customer.entity';
import { CustomerProvider } from '../../../customers/infrastructure/providers/customer.provider';
import {
  AGENDA_DB_CONNECTION_NAME,
  ARTIST_DB_CONNECTION_NAME,
  CUSTOMER_DB_CONNECTION_NAME,
  LOCATION_DB_CONNECTION_NAME,
} from '../../../databases/constants';
import { AddressType } from '../../../global/domain/interfaces/address.interface';
import { ArtistLocationProvider } from '../../../locations/infrastructure/database/artistLocation.provider';
import { ArtistLocation } from '../../../locations/infrastructure/entities/artistLocation.entity';
import { NotificationsModule } from '../../../notifications/notifications.module';
import { DeadLetterQueueModule } from '../../deadletter/deadletter.queue.module';
import { queues } from '../../queues';
import { JobHandlerFactory } from '../application/job.factory';
import { AgendaJobIdSchema, AgendaJobIdType } from '../domain/schemas/agenda';
import { JobType } from '../domain/schemas/job';

import { NotificationProcessor } from './notification.processor';

const mockBullQueue: Partial<Queue> = {
  add: jest.fn(),
  process: jest.fn(),
};
const logging = true;
jest.setTimeout(10000);
describe('NotificationProcessor E2E', () => {
  let jobHandlerFactory: JobHandlerFactory;
  let notificationProcessor: NotificationProcessor;
  const agendaToken = getRepositoryToken(Agenda);
  const agendaEventToken = getRepositoryToken(AgendaEvent);
  const agendaInvitationToken = getRepositoryToken(AgendaInvitation);
  const artistToken = getRepositoryToken(Artist);
  const contactToken = getRepositoryToken(Contact);
  const customerToken = getRepositoryToken(Customer);
  const locationToken = getRepositoryToken(ArtistLocation);

  let agendaProvider: AgendaProvider;
  let artistProvider: ArtistProvider;
  let customerProvider: CustomerProvider;
  let locationProvider: ArtistLocationProvider;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        NotificationsModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [sendGridConfig],
        }),
        BullModule.forRoot({
          redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
          },
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: 'inker-test',
          host: process.env.DB_HOST || '0.0.0.0',
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || 'root',
          port: parseInt(process.env.DB_PORT, 10),
          name: AGENDA_DB_CONNECTION_NAME,
          entities: [Agenda, AgendaEvent, AgendaInvitation],
          synchronize: true,
          dropSchema: true,
          logging,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: 'inker-test',
          host: process.env.DB_HOST || '0.0.0.0',
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || 'root',
          port: parseInt(process.env.DB_PORT, 10),
          name: ARTIST_DB_CONNECTION_NAME,
          entities: [Artist, Contact],
          synchronize: true,
          dropSchema: true,
          logging,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: 'inker-test',
          host: process.env.DB_HOST || '0.0.0.0',
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || 'root',
          port: parseInt(process.env.DB_PORT, 10),
          name: CUSTOMER_DB_CONNECTION_NAME,
          entities: [Customer],
          synchronize: true,
          dropSchema: true,
          logging,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          database: 'inker-test',
          host: process.env.DB_HOST || '0.0.0.0',
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD || 'root',
          port: parseInt(process.env.DB_PORT, 10),
          name: LOCATION_DB_CONNECTION_NAME,
          entities: [ArtistLocation],
          synchronize: true,
          dropSchema: true,
          logging,
          keepConnectionAlive: true,
        }),
        TypeOrmModule.forFeature(
          [Agenda, AgendaEvent, AgendaInvitation],
          AGENDA_DB_CONNECTION_NAME,
        ),
        TypeOrmModule.forFeature([Artist, Contact], ARTIST_DB_CONNECTION_NAME),
        TypeOrmModule.forFeature([Customer], CUSTOMER_DB_CONNECTION_NAME),
        TypeOrmModule.forFeature([ArtistLocation], LOCATION_DB_CONNECTION_NAME),
        DeadLetterQueueModule,
      ],
      providers: [
        NotificationProcessor,
        JobHandlerFactory,
        {
          provide: getQueueToken(queues.deadLetter.name),
          useValue: mockBullQueue,
        },
        {
          provide: agendaToken,
          useClass: Repository,
        },
        {
          provide: agendaEventToken,
          useClass: Repository,
        },
        {
          provide: agendaInvitationToken,
          useClass: Repository,
        },
        {
          provide: artistToken,
          useClass: Repository,
        },
        {
          provide: contactToken,
          useClass: Repository,
        },
        {
          provide: customerToken,
          useClass: Repository,
        },
        {
          provide: locationToken,
          useClass: Repository,
        },
        AgendaProvider,
        ArtistProvider,
        CustomerProvider,
        ArtistLocationProvider,
        AgendaEventProvider,
      ],
    }).compile();

    jobHandlerFactory = moduleFixture.get(JobHandlerFactory);
    agendaProvider = moduleFixture.get(AgendaProvider);
    artistProvider = moduleFixture.get(ArtistProvider);
    customerProvider = moduleFixture.get(CustomerProvider);
    locationProvider = moduleFixture.get(ArtistLocationProvider);
    notificationProcessor = moduleFixture.get(NotificationProcessor);
  });

  it.skip('should trigger email send when processing a job', async () => {
    const mockCustomer: Partial<Customer> = {
      id: 1,
      userId: 2,
      firstName: 'Lucas',
      lastName: 'Henry',
      contactEmail: 'lucas.henrydz@gmail.com',
      contactPhoneNumber: '123456789',
      follows: [],
      shortDescription: 'short description',
      profileThumbnail: 'thumbnail',
      rating: 4.5,
    };

    const mockLocation: Partial<ArtistLocation> = {
      id: 1,
      location: {
        coordinates: [1, 1],
        type: 'Point',
        bbox: [1, 1, 1, 1],
      },
      address1: 'address1',
      address2: 'address2',
      addressType: AddressType.HOME,
      artistId: 1,
      city: 'city',
      lat: 1,
      lng: 1,
      state: 'state',
      formattedAddress: 'formattedAddress',
      name: 'name',
      shortAddress1: '',
    };

    const mockAgenda: Partial<Agenda> = {
      artistId: 1,
      userId: 1,
      workingDays: ['1', '2', '3', '4', '5'],
      open: true,
      public: true,
    };

    await artistProvider.create({
      address: {
        address1: 'address1',
        address2: 'address2',
        addressType: AddressType.HOME,
        shortAddress1: '',
      },
      agendaIsOpen: true,
      agendaIsPublic: true,
      agendaWorkingDays: ['1', '2', '3', '4', '5'],
      firstName: 'John',
      lastName: 'Doe',
      userId: 1,
      username: 'johndoe',
      contactEmail: 'jon@doe.com',
      phoneNumberDetails: {
        countryCode: 'US',
        dialCode: '+1',
        number: '123456789',
      },
    });

    await customerProvider.save(mockCustomer as Customer);
    await locationProvider.save(mockLocation as ArtistLocation);
    await agendaProvider.save(mockAgenda as Agenda);
    await agendaProvider.createEventAndInvitationTransaction({
      agendaId: 1,
      title: 'title',
      info: 'info',
      color: '#000000',
      end: new Date().toDateString(),
      start: new Date().toDateString(),
      notification: true,
      customerId: 1,
    });

    const jobData = {
      jobId: 'EVENT_CREATED',
      metadata: { customerId: 1, eventId: 1, artistId: 1 },
      notificationTypeId: 'EMAIL',
    } satisfies JobType;

    const jobHandlerFactoryCreateSpy = jest.spyOn(jobHandlerFactory, 'create');
    const jobHandler = jobHandlerFactory.create(jobData);
    const jobHandlerHandleSpy = jest.spyOn(jobHandler, 'handle');

    const result = await moduleFixture.get(NotificationProcessor).process({
      data: jobData,
      id: '1',
      attemptsMade: 0,
    } as Job);

    expect(jobHandlerFactoryCreateSpy).toHaveBeenCalledWith(jobData);
    expect(jobHandlerHandleSpy).toHaveBeenCalledWith({
      jobId: 'EVENT_CREATED',
      metadata: { customerId: 1, eventId: 1, artistId: 1 },
      notificationTypeId: 'EMAIL',
    });
  });

  AgendaJobIdSchema.options.forEach(jobId => {
    it.skip(`should trigger email send when processing job type ${jobId}`, async () => {
      setupEntities();

      const jobData = {
        jobId: jobId,
        metadata: getJobMetadata(jobId),
        notificationTypeId: 'EMAIL',
      };

      const mockJob: Partial<Job> = {
        id: '1',
        attemptsMade: 0,
        data: jobData,
      };

      const result = await notificationProcessor.process(mockJob as Job);

      expect(result).toBeDefined();
    });
  });

  afterEach(async () => {
    await agendaProvider.source.transaction(async manager => {
      await manager.query(`TRUNCATE TABLE "artist" CASCADE`);
      await manager.query(`TRUNCATE TABLE "customer" CASCADE`);
      await manager.query(`TRUNCATE TABLE "contact" CASCADE`);
      await manager.query(`TRUNCATE TABLE "artist_location" CASCADE`);
      await manager.query(`TRUNCATE TABLE "agenda" CASCADE`);
      await manager.query(`TRUNCATE TABLE "agenda_event" CASCADE`);
    });
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  async function setupEntities() {
    const mockCustomer: Partial<Customer> = {
      id: 1,
      userId: 2,
      firstName: 'Lucas',
      lastName: 'Henry',
      contactEmail: 'lucas.henrydz@gmail.com',
      contactPhoneNumber: '123456789',
      follows: [],
      shortDescription: 'short description',
      profileThumbnail: 'thumbnail',
      rating: 4.5,
    };

    const mockLocation: Partial<ArtistLocation> = {
      id: 1,
      location: {
        coordinates: [1, 1],
        type: 'Point',
      },
      address1: 'address1',
      address2: 'address2',
      addressType: AddressType.HOME,
      artistId: 1,
      city: 'city',
      lat: 1,
      lng: 1,
      state: 'state',
      formattedAddress: 'formattedAddress',
      name: 'name',
      shortAddress1: '',
    };

    const mockAgenda: Partial<Agenda> = {
      artistId: 1,
      userId: 1,
      workingDays: ['1', '2', '3', '4', '5'],
      open: true,
      public: true,
    };

    await artistProvider.create({
      address: {
        address1: 'address1',
        address2: 'address2',
        addressType: AddressType.HOME,
        shortAddress1: '',
      },
      agendaIsOpen: true,
      agendaIsPublic: true,
      agendaWorkingDays: mockAgenda.workingDays,
      firstName: 'John',
      lastName: 'Doe',
      userId: 1,
      username: 'johndoe',
      contactEmail: 'jon@doe.com',
      phoneNumberDetails: {
        countryCode: 'US',
        dialCode: '+1',
        number: '123456789',
      },
    });

    await customerProvider.save(mockCustomer as Customer);
    await locationProvider.save(mockLocation as ArtistLocation);
    await agendaProvider.save(mockAgenda as Agenda);
    await agendaProvider.createEventAndInvitationTransaction({
      agendaId: 1,
      title: 'title',
      info: 'info',
      color: '#000000',
      end: new Date().toDateString(),
      start: new Date().toDateString(),
      notification: true,
      customerId: 1,
    });
    // Additional setups like creating events or invitations can be added here if needed
  }

  function getJobMetadata(jobId: AgendaJobIdType): any {
    switch (jobId) {
      case 'EVENT_CREATED':
        return { customerId: 1, eventId: 1, artistId: 1 };
      case 'EVENT_CANCELED':
        return { eventId: 1 };
      case 'EVENT_REMINDER':
        return { eventId: 1, reminderTime: new Date() }; // Example, assumes reminder needs a time
      case 'EVENT_UPDATED':
        return { eventId: 1, updatedFields: { title: 'Updated Title' } };
      case 'RSVP_ACCEPTED':
        return { invitationId: 1 };
      case 'RSVP_DECLINED':
        return { invitationId: 1 };
      case 'RSVP_UNSCHEDULABLE':
        return { customerId: 1, reason: 'Unavailable Time Slots' };
      default:
        return {};
    }
  }
});
