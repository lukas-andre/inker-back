import { Process } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';

import { queues } from '../queues';

@Injectable()
export class DeadLetterProcessor {
  @Process(queues.deadLetter.name)
  async process(job: Job<any>) {
    console.log('DeadLetterProcessor', job.data);
  }
}
