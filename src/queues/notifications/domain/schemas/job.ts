import { z } from 'zod';

import {
  AgendaEventCanceledJobSchema,
  AgendaEventCreatedJobSchema,
  AgendaEventReminderJobSchema,
  AgendaEventUpdatedJobSchema,
  RsvpAcceptedJobSchema,
  RsvpDeclinedJobSchema,
  RsvpUnschedulableJobSchema,
} from './agenda';

export const JobSchema = z.union([
  AgendaEventCreatedJobSchema,
  AgendaEventCanceledJobSchema,
  AgendaEventReminderJobSchema,
  AgendaEventUpdatedJobSchema,
  RsvpAcceptedJobSchema,
  RsvpDeclinedJobSchema,
  RsvpUnschedulableJobSchema,
]);

export type JobType = z.infer<typeof JobSchema>;
