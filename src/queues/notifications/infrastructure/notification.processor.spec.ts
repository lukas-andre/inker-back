import { getQueueToken } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Job, JobId, JobOptions, JobStatus } from 'bull';

import { sendGridConfig } from '../../../config/sendgrid.config';
import { queues } from '../../queues';
import { JobHandlerFactory } from '../application/job.factory';
import { AgendaEventcreatedJobType } from '../domain/schemas/agenda';

import { NotificationProcessor } from './notification.processor';
import { NotificationQueuePayload } from './queueNotification';

const mockJob: Job = {
  id: 'id',
  data: undefined,
  opts: undefined,
  attemptsMade: 0,
  queue: undefined,
  timestamp: 0,
  name: '',
  stacktrace: [],
  returnvalue: undefined,
  progress: function () {
    throw new Error('Function not implemented.');
  },
  log: function (row: string): Promise<any> {
    throw new Error('Function not implemented.');
  },
  isCompleted: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  isFailed: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  isDelayed: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  isActive: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  isWaiting: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  isPaused: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  isStuck: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  getState: function (): Promise<JobStatus | 'stuck'> {
    throw new Error('Function not implemented.');
  },
  update: function (data: NotificationQueuePayload): Promise<void> {
    throw new Error('Function not implemented.');
  },
  remove: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  retry: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  discard: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  finished: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
  moveToCompleted: function (
    returnValue?: string,
    ignoreLock?: boolean,
    notFetch?: boolean,
  ): Promise<[any, JobId]> {
    throw new Error('Function not implemented.');
  },
  moveToFailed: function (
    errorInfo: { message: string },
    ignoreLock?: boolean,
  ): Promise<[any, JobId]> {
    throw new Error('Function not implemented.');
  },
  promote: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  lockKey: function (): string {
    throw new Error('Function not implemented.');
  },
  releaseLock: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  takeLock: function (): Promise<number | false> {
    throw new Error('Function not implemented.');
  },
  extendLock: function (duration: number): Promise<number> {
    throw new Error('Function not implemented.');
  },
  toJSON: function (): {
    id: JobId;
    name: string;
    data: NotificationQueuePayload;
    opts: JobOptions;
    progress: number;
    delay: number;
    timestamp: number;
    attemptsMade: number;
    failedReason: any;
    stacktrace: string[];
    returnvalue: any;
    finishedOn: number;
    processedOn: number;
  } {
    throw new Error('Function not implemented.');
  },
};
export const mockBullQueue: any = {
  add: jest.fn(),
  process: jest.fn(),
};
describe('NotificationProcessor', () => {
  let notificationProcessor: NotificationProcessor;
  let jobHandlerFactory: JobHandlerFactory;
  let deadLetterQueue: typeof mockBullQueue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [sendGridConfig],
        }),
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

    jobHandlerFactory = module.get<JobHandlerFactory>(JobHandlerFactory);
    notificationProcessor = module.get<NotificationProcessor>(
      NotificationProcessor,
    );
    deadLetterQueue = module.get<typeof mockBullQueue>(
      getQueueToken(queues.deadLetter.name),
    );
  });

  it('should process a job', async () => {
    const jobData: AgendaEventcreatedJobType = {
      jobId: 'EVENT_CREATED',
      metadata: {
        customerId: '1',
        eventId: '',
      },
      notificationTypeId: 'EMAIL',
    };

    const job: Job = {
      ...mockJob,
      data: {
        ...jobData,
      },
    };

    // jest
    //   .spyOn(notificationService, 'sendCustomerNotification')
    //   .mockResolvedValue(undefined);

    await notificationProcessor.process(job);

    // expect(notificationFactory.createNotificationService).toHaveBeenCalledWith(
    //   job.data.notificationType,
    // );
    // expect(notificationService.sendCustomerNotification).toHaveBeenCalledWith({
    //   template: job.data.template,
    //   customerId: job.data.customerId,
    //   message: job.data.message,
    // });
  });

  // it('should move job to dead letter queue if attempts are exhausted', async () => {
  //   const job: Job<NotificationQueuePayload> = {
  //     ...mockJob,
  //     data: {
  //       template: NotificationEvents.EVENT_CREATED,
  //       customerId: 'customerId',
  //       message: 'message',
  //       notificationType: NotificationType.EMAIL,
  //     },
  //     attemptsMade: queues.notification.attempts + 1,
  //   };

  //   jest
  //     .spyOn(notificationFactory, 'createNotificationService')
  //     .mockReturnValue(notificationService);
  //   jest
  //     .spyOn(notificationService, 'sendCustomerNotification')
  //     .mockResolvedValue(undefined);

  //   await notificationProcessor.process(job);

  //   expect(
  //     notificationFactory.createNotificationService,
  //   ).not.toHaveBeenCalled();
  //   expect(notificationService.sendCustomerNotification).not.toHaveBeenCalled();
  //   expect(deadLetterQueue.add).toHaveBeenCalledWith(
  //     queues.deadLetter.name,
  //     job.data,
  //   );
  // });
});
