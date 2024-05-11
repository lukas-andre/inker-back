import { BullModule, getQueueToken } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import Bull, { Queue } from 'bull';

import { sendGridConfig } from '../../config/sendgrid.config';
import { DeadLetterQueueModule } from '../deadletter/deadletter.queue.module';
import { queues } from '../queues';

import { NotificationFactory } from './application/notification.factory';
import { NotificationEvents } from './domain/agenda.job';
import { NotificationType } from './domain/schemas/notification';
import { NotificationProcessor } from './infrastructure/notification.processor';
import { mockBullQueue } from './infrastructure/notification.processor.spec';

describe('NotificationQueue E2E', () => {
  let app: NestFastifyApplication;
  let notificationQueue: Queue;
  let notificationProcessor: NotificationProcessor;
  let deadLetterQueue: typeof mockBullQueue;
  let notificationFactory: NotificationFactory;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [sendGridConfig],
        }),
        BullModule.registerQueue({
          name: queues.notification.name,
          defaultJobOptions: {
            attempts: 3,
            lifo: false,
          },
          redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
          },
        }),
        DeadLetterQueueModule,
      ],
      providers: [
        NotificationProcessor,
        NotificationFactory,
        {
          provide: getQueueToken(queues.deadLetter.name),
          useValue: mockBullQueue,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    notificationQueue = moduleFixture.get(
      getQueueToken(queues.notification.name),
    );
    notificationProcessor = moduleFixture.get(NotificationProcessor);
    deadLetterQueue = moduleFixture.get<typeof mockBullQueue>(
      getQueueToken(queues.deadLetter.name),
    );
    notificationFactory =
      moduleFixture.get<NotificationFactory>(NotificationFactory);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should process a job E2E', async () => {
    const jobData = {
      data: {
        template: NotificationEvents.EVENT_CREATED,
        customerId: 'customerId',
        message: 'Your event has been created',
        notificationType: NotificationType.EMAIL,
      },
    };

    const spy = jest.spyOn(notificationProcessor, 'process');

    const job = await notificationQueue.add(jobData.data);

    let lastJob: Bull.Job<any>;
    notificationQueue.process(async (job, done) => {
      lastJob = job;
      const result = await notificationProcessor.process(job);
      done(null, result);
    });

    jest
      .spyOn(notificationFactory, 'createNotificationService')
      .mockReturnValue({
        sendCustomerNotification: jest.fn(),
      });
    await new Promise<void>((resolve, reject) => {
      notificationQueue.on('completed', (completedJob, result) => {
        try {
          expect(completedJob.id).toEqual(job.id);
          expect(spy).toHaveBeenCalledWith(lastJob);
          expect(
            notificationFactory.createNotificationService,
          ).toHaveBeenCalledWith(job.data.notificationType);

          expect(
            notificationFactory.createNotificationService(
              job.data.notificationType,
            ).sendCustomerNotification,
          ).toHaveBeenCalledWith({
            template: job.data.template,
            customerId: job.data.customerId,
            message: job.data.message,
          });

          expect(result).toEqual(expect.anything());
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      notificationQueue.on('failed', (failedJob, err) => {
        reject(err);
      });
    });
  });
});
