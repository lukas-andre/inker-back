import { z } from 'zod';

import { NotificationTypeSchema } from './notification';

// Define Job IDs for Quotation Offers
export const QuotationOfferJobIdSchema = z.enum([
  'NEW_OFFER_RECEIVED',
  'OFFER_ACCEPTED', // Notify winning artist
  'OFFER_REJECTED', // Notify losing artist
  // Add other potential offer-related job IDs like OFFER_WITHDRAWN if needed
]);
export type QuotationOfferJobIdType = z.infer<typeof QuotationOfferJobIdSchema>;

// Base structure for quotation offer jobs
const QuotationOfferBaseJobSchema = z.object({
  jobId: QuotationOfferJobIdSchema,
  notificationTypeId: NotificationTypeSchema, // Re-use existing notification type schema
});

// Schema for NEW_OFFER_RECEIVED (sent to customer)
const NewOfferReceivedJobSchema = QuotationOfferBaseJobSchema.extend({
  jobId: z.literal(QuotationOfferJobIdSchema.enum.NEW_OFFER_RECEIVED),
  metadata: z.object({
    offerId: z.string(),
    quotationId: z.string(),
    customerId: z.string(), // The customer who owns the quotation
    artistId: z.string(), // The artist who submitted the offer
    // Include artist name/details if needed directly in notification payload
  }),
});
export type NewOfferReceivedJobType = z.infer<typeof NewOfferReceivedJobSchema>;

// Schema for OFFER_ACCEPTED (sent to the winning artist)
const OfferAcceptedJobSchema = QuotationOfferBaseJobSchema.extend({
  jobId: z.literal(QuotationOfferJobIdSchema.enum.OFFER_ACCEPTED),
  metadata: z.object({
    offerId: z.string(),
    quotationId: z.string(),
    customerId: z.string(),
    acceptedArtistId: z.string(), // The artist whose offer was accepted
  }),
});
export type OfferAcceptedJobType = z.infer<typeof OfferAcceptedJobSchema>;

// Schema for OFFER_REJECTED (sent to artists whose offers were not chosen)
const OfferRejectedJobSchema = QuotationOfferBaseJobSchema.extend({
  jobId: z.literal(QuotationOfferJobIdSchema.enum.OFFER_REJECTED),
  metadata: z.object({
    offerId: z.string(),
    quotationId: z.string(),
    customerId: z.string(),
    rejectedArtistId: z.string(), // The artist whose offer was rejected
  }),
});
export type OfferRejectedJobType = z.infer<typeof OfferRejectedJobSchema>;

// Union type for all quotation offer jobs
export type QuotationOfferJobType =
  | NewOfferReceivedJobType
  | OfferAcceptedJobType
  | OfferRejectedJobType;

// Export individual schemas if needed by job handlers
export {
  NewOfferReceivedJobSchema,
  OfferAcceptedJobSchema,
  OfferRejectedJobSchema,
};
