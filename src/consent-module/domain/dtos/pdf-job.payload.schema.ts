import { z } from 'zod';

export const PdfJobPayloadSchema = z.object({
  signedConsentId: z.string().uuid(),
});

export type PdfJobPayload = z.infer<typeof PdfJobPayloadSchema>;
