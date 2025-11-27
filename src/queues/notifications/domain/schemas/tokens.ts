import { z } from 'zod';

// Token notification job IDs
export const LOW_TOKEN_BALANCE = 'LOW_TOKEN_BALANCE' as const;
export const TOKEN_PURCHASE_CONFIRMATION = 'TOKEN_PURCHASE_CONFIRMATION' as const;
export const TOKEN_GRANT_NOTIFICATION = 'TOKEN_GRANT_NOTIFICATION' as const;

export const TokenJobIdSchema = z.enum([
  LOW_TOKEN_BALANCE,
  TOKEN_PURCHASE_CONFIRMATION,
  TOKEN_GRANT_NOTIFICATION,
]);

const BaseTokenJobSchema = z.object({
  userId: z.string(),
  userTypeId: z.string(),
});

// Low Token Balance Notification
export const LowTokenBalanceJobSchema = BaseTokenJobSchema.extend({
  jobId: z.literal(LOW_TOKEN_BALANCE),
  metadata: z.object({
    currentBalance: z.number(),
    threshold: z.number(),
    lastConsumedAt: z.date().optional(),
  }),
});
export type LowTokenBalanceJobType = z.infer<typeof LowTokenBalanceJobSchema>;

// Token Purchase Confirmation
export const TokenPurchaseConfirmationJobSchema = BaseTokenJobSchema.extend({
  jobId: z.literal(TOKEN_PURCHASE_CONFIRMATION),
  metadata: z.object({
    transactionId: z.string(),
    packageId: z.string(),
    packageName: z.string(),
    tokensAmount: z.number(),
    price: z.number(),
    currency: z.string(),
    paymentMethod: z.string().optional(),
    newBalance: z.number(),
  }),
});
export type TokenPurchaseConfirmationJobType = z.infer<typeof TokenPurchaseConfirmationJobSchema>;

// Token Grant Notification (for admin grants)
export const TokenGrantNotificationJobSchema = BaseTokenJobSchema.extend({
  jobId: z.literal(TOKEN_GRANT_NOTIFICATION),
  metadata: z.object({
    tokensGranted: z.number(),
    reason: z.string(),
    newBalance: z.number(),
    grantedBy: z.string().optional(),
  }),
});
export type TokenGrantNotificationJobType = z.infer<typeof TokenGrantNotificationJobSchema>;