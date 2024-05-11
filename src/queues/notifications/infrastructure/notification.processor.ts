import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { ZodError } from 'zod';

import { BaseComponent } from '../../../global/domain/components/base.component';
import { queues } from '../../queues';
import { JobHandlerFactory } from '../application/job.factory';
import { JobTypeSchemaRegistry } from '../domain/jobSchema.registry';
import { JobType } from '../domain/schemas/job';

type AnyJobData = any;

@Processor(queues.notification.name)
export class NotificationProcessor extends BaseComponent {
  constructor(
    @InjectQueue(queues.deadLetter.name)
    private readonly deadLetterQueue: Queue,
    private readonly jobHandlerFactory: JobHandlerFactory,
  ) {
    super(NotificationProcessor.name);
    this.logger.log('Notification processor initialized');
  }

  @Process()
  async process(job: Job<JobType>): Promise<void> {
    if (this.shouldMoveToDeadLetter(job)) {
      await this.moveToDeadLetter(job);
      return;
    }

    try {
      this.validateJob(job.data);
    } catch (error: any | ZodError) {
      this.logger.error(error);
      throw error;
    }

    const jobHandler = this.jobHandlerFactory.create(job.data);
    await jobHandler.handle(job.data as AnyJobData);
  }

  private shouldMoveToDeadLetter(job: Job<JobType>): boolean {
    return job.attemptsMade > queues.notification.attempts;
  }

  private async moveToDeadLetter(job: Job<JobType>): Promise<void> {
    await this.deadLetterQueue.add(queues.deadLetter.name, job.data);
    this.logger.warn(
      `Job ${job.id} moved to dead letter queue after ${job.attemptsMade} attempts`,
    );
  }

  /**
   * Validates the notification job schema.
   * @param jobData The job data to validate.
   * @throws ValidationError if the job is invalid.
   */
  private validateJob(jobData: JobType): void {
    const validator = JobTypeSchemaRegistry[jobData.jobId];
    if (!validator) {
      throw new Error(`Validator not found for job ID ${jobData.jobId}`);
    }
    validator.parse(jobData);
  }
}
