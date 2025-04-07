import { Process } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';

import { BaseComponent } from '../../global/domain/components/base.component';
import { queues } from '../queues';

@Injectable()
export class DeadLetterProcessor extends BaseComponent {
  constructor() {
    super(DeadLetterProcessor.name);
    this.logger.log('DeadLetterProcessor initialized');
  }

  @Process(queues.deadLetter.name)
  async process(job: Job<any>) {
    console.log('DeadLetterProcessor', job.data);
  }
}
