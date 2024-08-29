import { z } from 'zod';

import { NotificationTypeSchema } from './notification';
import {
  ArtistCancelReasonSchema,
  CancelReasonTypeSchema,
  CustomerCancelReasonSchema,
  SystemCancelReasonSchema,
} from './quotationCancelReasons';

export const QuotationJobIdSchema = z.enum([
  'QUOTATION_CREATED',
  'QUOTATION_REPLIED',
  'QUOTATION_ACCEPTED',
  'QUOTATION_REJECTED',
  'QUOTATION_APPEALED',
  'QUOTATION_CANCELED',
]);
export type QuotationJobIdType = z.infer<typeof QuotationJobIdSchema>;

const QuotationJobSchema = z.object({
  jobId: QuotationJobIdSchema,
  notificationTypeId: NotificationTypeSchema,
  metadata: z.object({
    customerId: z.number(),
    artistId: z.number(),
    quotationId: z.number(),
  }),
});

const QuotationCreatedJobSchema = QuotationJobSchema.extend({
  jobId: z.literal(QuotationJobIdSchema.enum.QUOTATION_CREATED),
});
export type QuotationCreatedJobType = z.infer<typeof QuotationCreatedJobSchema>;

const QuotationRepliedJobSchema = QuotationJobSchema.extend({
  jobId: z.literal(QuotationJobIdSchema.enum.QUOTATION_REPLIED),
});
export type QuotationRepliedJobType = z.infer<typeof QuotationRepliedJobSchema>;

const QuotationAcceptedJobSchema = QuotationJobSchema.extend({
  jobId: z.literal(QuotationJobIdSchema.enum.QUOTATION_ACCEPTED),
});
export type QuotationAcceptedJobType = z.infer<
  typeof QuotationAcceptedJobSchema
>;

const QuotationRejectedJobSchema = QuotationJobSchema.extend({
  jobId: z.literal(QuotationJobIdSchema.enum.QUOTATION_REJECTED),
});
export type QuotationRejectedJobType = z.infer<
  typeof QuotationRejectedJobSchema
>;

const QuotationAppealedJobSchema = QuotationJobSchema.extend({
  jobId: z.literal(QuotationJobIdSchema.enum.QUOTATION_APPEALED),
});
export type QuotationAppealedJobType = z.infer<
  typeof QuotationAppealedJobSchema
>;

const QuotationCanceledJobSchema = QuotationJobSchema.extend({
  jobId: z.literal(QuotationJobIdSchema.enum.QUOTATION_CANCELED),
  metadata: z.object({
    quotationId: z.number(),
    artistId: z.number(),
    customerId: z.number(),
    canceledBy: z.enum(['artist', 'customer', 'system']),
    cancelReasonType: CancelReasonTypeSchema,
    cancelReason: z.union([
      CustomerCancelReasonSchema,
      ArtistCancelReasonSchema,
      SystemCancelReasonSchema,
    ]),
    cancelReasonDetails: z.string().optional(),
  }),
});
export type QuotationCanceledJobType = z.infer<
  typeof QuotationCanceledJobSchema
>;

export type QuotationJobType =
  | QuotationCreatedJobType
  | QuotationRepliedJobType
  | QuotationAcceptedJobType
  | QuotationRejectedJobType
  | QuotationAppealedJobType
  | QuotationCanceledJobType;

export {
  QuotationCreatedJobSchema,
  QuotationRepliedJobSchema,
  QuotationAcceptedJobSchema,
  QuotationRejectedJobSchema,
  QuotationAppealedJobSchema,
  QuotationCanceledJobSchema,
};
