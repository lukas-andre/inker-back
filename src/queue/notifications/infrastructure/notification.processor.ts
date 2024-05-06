import { InjectQueue, Process } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';

import { queues } from '../../queues';
import { NotificationFactory } from '../application/notification.factory';

import { NotificationQueuePayload } from './queueNotification';

@Injectable()
export class NotificationProcessor {
  constructor(
    @InjectQueue(queues.deadLetter.name)
    private readonly deadLetterQueue: Queue,
    private readonly notificationFactory: NotificationFactory,
  ) {
    console.log('NotificationProcessor created');
  }
  @Process(queues.notification.name)
  async process(job: Job<NotificationQueuePayload>) {
    console.log('processing notification job');

    if (job.attemptsMade > queues.notification.attempts) {
      this.deadLetterQueue.add(queues.deadLetter.name, job.data);
      return;
    }

    const { template, customerId, message, notificationType } = job.data;

    const notificationService =
      this.notificationFactory.createNotificationService(notificationType);

    await notificationService.sendCustomerNotification({
      template,
      customerId,
      message,
    });

    return { success: true };
  }
}
