ALTER TABLE public.token_balance ADD CONSTRAINT token_balance_user_id_key UNIQUE (user_id);
ALTER TABLE public.token_balance ADD CONSTRAINT token_balance_balance_check CHECK ((balance >= 0));
ALTER TABLE public.token_balance ADD CONSTRAINT token_balance_user_type_check CHECK (((user_type)::text = ANY ((ARRAY['CUSTOMER'::character varying, 'ARTIST'::character varying, 'ADMIN'::character varying])::text[])));
ALTER TABLE public.token_transaction ADD CONSTRAINT token_transaction_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'COMPLETED'::character varying, 'FAILED'::character varying, 'REFUNDED'::character varying])::text[])));
ALTER TABLE public.token_transaction ADD CONSTRAINT token_transaction_type_check CHECK (((type)::text = ANY ((ARRAY['PURCHASE'::character varying, 'CONSUME'::character varying, 'GRANT'::character varying, 'REFUND'::character varying, 'MANUAL_ADJUSTMENT'::character varying])::text[])));
ALTER TABLE public.token_transaction ADD CONSTRAINT token_transaction_user_type_check CHECK (((user_type)::text = ANY ((ARRAY['CUSTOMER'::character varying, 'ARTIST'::character varying, 'ADMIN'::character varying])::text[])));
