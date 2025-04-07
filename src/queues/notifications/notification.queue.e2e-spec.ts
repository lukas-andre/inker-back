import { BullModule, getQueueToken } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import Bull, { Queue } from 'bull';

import { sendGridConfig } from '../../config/sendgrid.config';
import { NotificationsModule } from '../../notifications/notifications.module';
import { DeadLetterQueueModule } from '../deadletter/deadletter.queue.module';
import { queues } from '../queues';

import { JobHandlerFactory } from './application/job.factory';
import { JobType } from './domain/schemas/job';
import { NotificationProcessor } from './infrastructure/notification.processor';

const mockBullQueue: Partial<Queue> = {
  add: jest.fn(),
  process: jest.fn(),
};

describe('NotificationQueue E2E', () => {
  let app: NestFastifyApplication;
  let notificationQueue: Queue;
  let jobHandlerFactory: JobHandlerFactory;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        NotificationsModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [sendGridConfig],
        }),
        BullModule.registerQueue({
          name: queues.notification.name,
          redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
          },
        }),
        DeadLetterQueueModule,
      ],
      providers: [
        NotificationProcessor,
        JobHandlerFactory,
        {
          provide: getQueueToken(queues.deadLetter.name),
          useValue: mockBullQueue,
        },
      ],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter());
    await app.init();
    notificationQueue = app.get<Queue>(getQueueToken(queues.notification.name));
    jobHandlerFactory = app.get(JobHandlerFactory);
  });

  it('should trigger email send when processing a job', async () => {
    const jobData = {
      jobId: 'EVENT_CREATED',
      metadata: { customerId: 1, eventId: 1, artistId: 1 },
      notificationTypeId: 'EMAIL',
    } satisfies JobType;

    const jobHandlerFactoryCreateSpy = jest.spyOn(jobHandlerFactory, 'create');
    const jobHandler = jobHandlerFactory.create(jobData);
    const jobHandlerHandleSpy = jest.spyOn(jobHandler, 'handle');

    await notificationQueue.add(jobData);

    notificationQueue.process(async (job, done) => {
      const result = await app.get(NotificationProcessor).process(job);
      done(null, result);
    });

    await new Promise<void>((resolve, reject) => {
      notificationQueue.on('completed', () => {
        try {
          // 2 calls because one is in the test and the other is in the processor,
          // sorry for the that's now i dont find a better way to test factory.create
          // withour creating a new class on the test
          expect(jobHandlerFactoryCreateSpy).toHaveBeenCalledTimes(2);
          expect(jobHandlerHandleSpy).toHaveBeenCalledWith({
            jobId: 'EVENT_CREATED',
            metadata: { customerId: '1', eventId: '100' },
            notificationTypeId: 'EMAIL',
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      notificationQueue.on('failed', error => {
        reject(error);
      });

      notificationQueue.on('error', error => {
        reject(error);
      });
      notificationQueue.on('stalled', () => {
        reject(new Error('Job stalled'));
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
