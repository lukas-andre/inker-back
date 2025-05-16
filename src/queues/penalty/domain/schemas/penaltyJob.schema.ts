import { z } from 'zod';
import { PenaltyStatus, PenaltyType } from '../../../../agenda/domain/enum';

// Corresponds to PenaltyUserRole in cancellationPenalty.entity.ts
const PenaltyUserRoleSchema = z.union([
  z.literal('artist'),
  z.literal('customer'),
]);

// Corresponds to CancellationPenaltyMetadata in cancellationPenalty.entity.ts
const CancellationPenaltyMetadataSchema = z.object({
  cancellationTime: z.coerce.date(),
  originalEventStart: z.coerce.date(),
  userRole: PenaltyUserRoleSchema,
  appliedAt: z.coerce.date().optional(),
  reason: z.string().optional(),
  waivedBy: z.string().uuid().optional(),
  cancellationInitiatorId: z.string().uuid(),
});

// Corresponds to CancellationPenalty entity
export const CancellationPenaltySchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.nativeEnum(PenaltyType),
  amount: z.number().nullable(),
  reputationPoints: z.number().int().nullable(),
  metadata: CancellationPenaltyMetadataSchema,
  status: z.nativeEnum(PenaltyStatus),
  agendaId: z.string().uuid().nullable(),
  quotationId: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable().optional(),
});

export const PROCESS_PENALTY_V1 = 'PROCESS_PENALTY_V1';

export const ProcessPenaltyV1JobSchema = z.object({
  jobId: z.literal(PROCESS_PENALTY_V1),
  penalty: CancellationPenaltySchema,
});

export type ProcessPenaltyV1Job = z.infer<typeof ProcessPenaltyV1JobSchema>; 