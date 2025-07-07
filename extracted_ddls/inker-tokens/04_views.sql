CREATE OR REPLACE VIEW public.admin_manual_adjustments AS  SELECT id,
    user_id,
    user_type,
    user_type_id,
    amount,
    balance_before,
    balance_after,
    metadata ->> 'reason'::text AS reason,
    metadata ->> 'adminUserId'::text AS admin_user_id,
    ip_address,
    created_at
   FROM token_transaction t
  WHERE type::text = 'MANUAL_ADJUSTMENT'::text
  ORDER BY created_at DESC;;
