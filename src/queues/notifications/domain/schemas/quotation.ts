import { z } from 'zod';

import { NotificationTypeSchema } from './notification';


export const QuotationJobIdSchema = z.enum([
  'QUOTATION_CREATED',
  'QUOTATION_REPLIED',
  'QUOTATION_ACCEPTED',
  'QUOTATION_REJECTED',
  'QUOTATION_APPEALED',
  'QUOTATION_CANCELED',
]);
export type QuotationJobIdType = z.infer<typeof QuotationJobIdSchema>;
export type QuotationCustomerActionJobIdType =
  | 'QUOTATION_ACCEPTED'
  | 'QUOTATION_REJECTED'
  | 'QUOTATION_APPEALED'
  | 'QUOTATION_CANCELED';
export type QuotationArtistActionJobIdType =
  | 'QUOTATION_REPLIED'
  | 'QUOTATION_REJECTED';

const QuotationJobSchema = z.object({
  jobId: QuotationJobIdSchema,
  notificationTypeId: NotificationTypeSchema,
  metadata: z.object({
    customerId: z.string(),
    artistId: z.string(),
    quotationId: z.string(),
  }),
});

const QuotationCreatedJobSchema = QuotationJobSchema.extend({
  jobId: z.literal(QuotationJobIdSchema.enum.QUOTATION_CREATED),
});
export type QuotationCreatedJobType = z.infer<typeof QuotationCreatedJobSchema>;

const QuotationRepliedJobSchema = QuotationJobSchema.extend({
  jobId: z.literal(QuotationJobIdSchema.enum.QUOTATION_REPLIED),
  metadata: z.object({
    quotationId: z.string(),
    artistId: z.string(),
    customerId: z.string(),
    estimatedCost: z
      .object({
        amount: z.number(),
        currency: z.string(),
      })
      .optional(),
    appointmentDate: z.string().optional(),
    appointmentDuration: z.number().optional(),
    additionalDetails: z.string().optional(),
  }),
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
  metadata: z.object({
    by: z.enum(['artist', 'customer', 'system']),
    quotationId: z.string(),
    artistId: z.string(),
    customerId: z.string(),
    rejectionReason: z.string(),
    additionalDetails: z.string().optional(),
  }),
});
export type QuotationRejectedJobType = z.infer<
  typeof QuotationRejectedJobSchema
>;

const QuotationAppealedJobSchema = QuotationJobSchema.extend({
  jobId: z.literal(QuotationJobIdSchema.enum.QUOTATION_APPEALED),
  metadata: z.object({
    quotationId: z.string(),
    artistId: z.string(),
    customerId: z.string(),
    appealReason: z.string(),
    additionalDetails: z.string().optional(),
  }),
});
export type QuotationAppealedJobType = z.infer<
  typeof QuotationAppealedJobSchema
>;

const QuotationCanceledJobSchema = QuotationJobSchema.extend({
  jobId: z.literal(QuotationJobIdSchema.enum.QUOTATION_CANCELED),
  metadata: z.object({
    quotationId: z.string(),
    artistId: z.string(),
    customerId: z.string(),
  }),
});
export type QuotationCanceledJobType = z.infer<
  typeof QuotationCanceledJobSchema
>;

export type QuotationCustomerActionJobType =
  | QuotationCanceledJobType
  | QuotationAcceptedJobType
  | QuotationAppealedJobType
  | QuotationRejectedJobType;

export type QuotationArtistActionJobType =
  | QuotationRepliedJobType
  | QuotationRejectedJobType;

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
