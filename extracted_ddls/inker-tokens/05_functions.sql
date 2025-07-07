CREATE OR REPLACE FUNCTION public.uuid_nil()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_nil$function$
;
CREATE OR REPLACE FUNCTION public.uuid_ns_dns()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_dns$function$
;
CREATE OR REPLACE FUNCTION public.uuid_ns_url()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_url$function$
;
CREATE OR REPLACE FUNCTION public.uuid_ns_oid()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_oid$function$
;
CREATE OR REPLACE FUNCTION public.uuid_ns_x500()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_x500$function$
;
CREATE OR REPLACE FUNCTION public.uuid_generate_v1()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1$function$
;
CREATE OR REPLACE FUNCTION public.uuid_generate_v1mc()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1mc$function$
;
CREATE OR REPLACE FUNCTION public.uuid_generate_v3(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v3$function$
;
CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v4$function$
;
CREATE OR REPLACE FUNCTION public.uuid_generate_v5(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v5$function$
;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.grant_tokens_manual(p_user_id character varying, p_user_type character varying, p_user_type_id character varying, p_amount integer, p_reason text, p_admin_user_id character varying)
 RETURNS TABLE(success boolean, new_balance integer, transaction_id uuid)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_transaction_id UUID;
BEGIN
    -- Iniciar transacción
    BEGIN
        -- Obtener o crear balance
        INSERT INTO token_balance (user_id, user_type, user_type_id, balance, total_granted)
        VALUES (p_user_id, p_user_type, p_user_type_id, 0, 0)
        ON CONFLICT (user_id) DO NOTHING;
        
        -- Obtener balance actual con lock
        SELECT balance INTO v_current_balance
        FROM token_balance
        WHERE user_id = p_user_id
        FOR UPDATE;
        
        -- Calcular nuevo balance
        v_new_balance := v_current_balance + p_amount;
        
        -- Actualizar balance
        UPDATE token_balance
        SET balance = v_new_balance,
            total_granted = total_granted + p_amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id;
        
        -- Crear transacción
        INSERT INTO token_transaction (
            user_id, user_type, user_type_id, type, amount,
            balance_before, balance_after, status, metadata
        )
        VALUES (
            p_user_id, p_user_type, p_user_type_id, 'MANUAL_ADJUSTMENT', p_amount,
            v_current_balance, v_new_balance, 'COMPLETED',
            jsonb_build_object(
                'reason', p_reason,
                'adminUserId', p_admin_user_id,
                'grantedAt', CURRENT_TIMESTAMP
            )
        )
        RETURNING id INTO v_transaction_id;
        
        RETURN QUERY SELECT true, v_new_balance, v_transaction_id;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN QUERY SELECT false, 0, NULL::UUID;
    END;
END;
$function$
;
