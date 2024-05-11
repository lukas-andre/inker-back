import { InjectQueue, Process } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';

import { queues } from '../../queues';
import { JobHandlerFactory } from '../application/job.factory';
import { jobSchemaMap } from '../domain/jobSchema.map';
import { JobType } from '../domain/schemas/job';

@Injectable()
export class NotificationProcessor {
  constructor(
    @InjectQueue(queues.deadLetter.name)
    private readonly deadLetterQueue: Queue,
    private readonly jobHandlerFactory: JobHandlerFactory,
  ) {
    console.log('NotificationProcessor created');
  }
  @Process(queues.notification.name)
  async process(queueJob: Job<JobType>) {
    console.log('processing notification job');
    if (queueJob.attemptsMade > queues.notification.attempts) {
      this.deadLetterQueue.add(queues.deadLetter.name, queueJob.data);
      return;
    }

    try {
      const validatedJob: JobType = jobSchemaMap[queueJob.data?.jobId].parse(
        queueJob.data,
      );
      console.log('Job validated successfully', validatedJob);

      const jobHandler = this.jobHandlerFactory.create(validatedJob);

      await jobHandler.handle(validatedJob as any);

      return { success: true };
    } catch (error) {
      console.error('Validation or processing failed:', error);
      throw new Error('Job validation failed');
    }
  }
}
