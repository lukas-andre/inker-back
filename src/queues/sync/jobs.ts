import { z } from "zod";

export const SyncJobIdSchema = z.enum(['SYNC_ARTIST_RATINGS']);
export type SyncJobIdType = z.infer<typeof SyncJobIdSchema>;

const SyncJobSchema = z.object({
  jobId: SyncJobIdSchema,
});
export type SyncJobType = z.infer<typeof SyncJobSchema>;

const SyncArtistRatingsJobSchema = SyncJobSchema.extend({
  jobId: z.literal(SyncJobIdSchema.enum.SYNC_ARTIST_RATINGS),
  metadata: z.object({
    artistId: z.number(),
  }),
});
export type SyncArtistRatingsJobType = z.infer<
  typeof SyncArtistRatingsJobSchema
>;

export { SyncArtistRatingsJobSchema };
