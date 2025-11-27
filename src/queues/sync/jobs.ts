import { z } from 'zod';

export const SyncJobIdSchema = z.enum([
  'SYNC_ARTIST_RATINGS',
  'CREATE_AGENDA_EVENT',
]);
export type SyncJobIdType = z.infer<typeof SyncJobIdSchema>;

const SyncJobSchema = z.object({
  jobId: SyncJobIdSchema,
});
export type SyncJobType = z.infer<typeof SyncJobSchema>;

const SyncArtistRatingsJobSchema = SyncJobSchema.extend({
  jobId: z.literal(SyncJobIdSchema.enum.SYNC_ARTIST_RATINGS),
  metadata: z.object({
    artistId: z.string(),
  }),
});
export type SyncArtistRatingsJobType = z.infer<
  typeof SyncArtistRatingsJobSchema
>;

const CreateAgendaEventJobSchema = SyncJobSchema.extend({
  jobId: z.literal(SyncJobIdSchema.enum.CREATE_AGENDA_EVENT),
  metadata: z.object({
    artistId: z.string(),
    quotationId: z.string(),
  }),
});
export type CreateAgendaEventJobType = z.infer<
  typeof CreateAgendaEventJobSchema
>;

export { SyncArtistRatingsJobSchema, CreateAgendaEventJobSchema };
