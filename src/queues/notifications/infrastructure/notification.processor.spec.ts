import { getQueueToken } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bull';
import { ZodError } from 'zod';

import { sendGridConfig } from '../../../config/sendgrid.config';
import { queues } from '../../queues';
import { JobHandlerFactory } from '../application/job.factory';
import { NotificationJob } from '../application/jobs/notification.job';
import { AgendaEventcreatedJobType } from '../domain/schemas/agenda';

import { NotificationProcessor } from './notification.processor';

const mockJob: Partial<Job<AgendaEventcreatedJobType>> = {
  id: '1',
  attemptsMade: 0,
  data: {
    jobId: 'EVENT_CREATED',
    metadata: {
      customerId: 1,
      eventId: 1,
      artistId: 1,
    },
    notificationTypeId: 'EMAIL',
  },
};

const mockJobHandler: Partial<NotificationJob> = {
  handle: jest.fn(),
};

const mockJobHandlerFactory: Partial<JobHandlerFactory> = {
  create: jest.fn(() => mockJobHandler as NotificationJob),
};

const mockDeadLetterQueue: any = {
  add: jest.fn(),
};

describe('NotificationProcessor', () => {
  let notificationProcessor: NotificationProcessor;

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
        { provide: JobHandlerFactory, useValue: mockJobHandlerFactory },
        {
          provide: getQueueToken(queues.deadLetter.name),
          useValue: mockDeadLetterQueue,
        },
      ],
    }).compile();

    notificationProcessor = module.get<NotificationProcessor>(
      NotificationProcessor,
    );
  });

  it('should process a valid job correctly', async () => {
    await notificationProcessor.process(
      mockJob as Job<AgendaEventcreatedJobType>,
    );
    expect(mockJobHandlerFactory.create).toHaveBeenCalledWith(mockJob.data);
    expect(mockJobHandler.handle).toHaveBeenCalledWith(mockJob.data);
  });

  it('should validate and throw error on invalid job', async () => {
    const badJob = {
      ...mockJob,
      data: {
        jobId: 'UNKNOWN',
        metadata: {},
        notificationTypeId: 'EMAIL',
      },
    };
    try {
      await notificationProcessor.process(
        badJob as Job<AgendaEventcreatedJobType>,
      );
    } catch (error) {
      expect((error as Error)?.message).toContain('Validator not found');
    }
  });

  it('should validate and throw ZodError on invalid job data', async () => {
    const badJob = {
      ...mockJob,
      data: {
        jobId: 'EVENT_CREATED',
        metadata: {},
        notificationTypeId: 'EMAIL',
      },
    };
    try {
      await notificationProcessor.process(
        badJob as Job<AgendaEventcreatedJobType>,
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
    }
  });

  it('should move job to dead letter queue if attempts are exhausted', async () => {
    const jobWithExhaustedAttempts = {
      ...mockJob,
      attemptsMade: queues.notification.attempts + 1,
    };
    await notificationProcessor.process(
      jobWithExhaustedAttempts as Job<AgendaEventcreatedJobType>,
    );
    expect(mockDeadLetterQueue.add).toHaveBeenCalledWith(
      queues.deadLetter.name,
      jobWithExhaustedAttempts.data,
    );
  });
});
