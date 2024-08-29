import { z } from 'zod';

export const CancelReasonTypeSchema = z.enum(['customer', 'artist', 'system']);
export const CustomerCancelReasonSchema = z.enum([
  'change_of_mind',
  'found_another_artist',
  'financial_reasons',
  'personal_reasons',
  'other',
]);

export const ArtistCancelReasonSchema = z.enum([
  'scheduling_conflict',
  'artistic_disagreement',
  'health_reasons',
  'equipment_issues',
  'other',
]);

export const SystemCancelReasonSchema = z.enum(['not_attended']);

export type CancelReasonType = z.infer<typeof CancelReasonTypeSchema>;
export type CustomerCancelReason = z.infer<typeof CustomerCancelReasonSchema>;
export type ArtistCancelReason = z.infer<typeof ArtistCancelReasonSchema>;
export type SystemCancelReason = z.infer<typeof SystemCancelReasonSchema>;
