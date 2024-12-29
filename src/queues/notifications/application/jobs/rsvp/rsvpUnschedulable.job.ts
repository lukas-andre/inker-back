import { RsvpUnschedulableJobType } from '../../../domain/schemas/agenda';
import { NotificationJob } from '../notification.job';

export class RsvpUnschedulableJob implements NotificationJob {
  async handle(job: RsvpUnschedulableJobType): Promise<void> {
    console.log(
      `Handling EMAIL for RSVP unschedulable for customer ${job.jobId}`,
    );
  }
}
