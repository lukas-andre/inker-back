--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Debian 17.2-1.pgdg110+1)
-- Dumped by pg_dump version 17.2 (Debian 17.2-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: grant_tokens_manual(character varying, character varying, character varying, integer, text, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.grant_tokens_manual(p_user_id character varying, p_user_type character varying, p_user_type_id character varying, p_amount integer, p_reason text, p_admin_user_id character varying) RETURNS TABLE(success boolean, new_balance integer, transaction_id uuid)
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: token_transaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.token_transaction (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id character varying(255) NOT NULL,
    user_type character varying(50) NOT NULL,
    user_type_id character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    amount integer NOT NULL,
    balance_before integer NOT NULL,
    balance_after integer NOT NULL,
    status character varying(50) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT token_transaction_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'COMPLETED'::character varying, 'FAILED'::character varying, 'REFUNDED'::character varying])::text[]))),
    CONSTRAINT token_transaction_type_check CHECK (((type)::text = ANY ((ARRAY['PURCHASE'::character varying, 'CONSUME'::character varying, 'GRANT'::character varying, 'REFUND'::character varying, 'MANUAL_ADJUSTMENT'::character varying])::text[]))),
    CONSTRAINT token_transaction_user_type_check CHECK (((user_type)::text = ANY ((ARRAY['CUSTOMER'::character varying, 'ARTIST'::character varying, 'ADMIN'::character varying])::text[])))
);


--
-- Name: admin_manual_adjustments; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.admin_manual_adjustments AS
 SELECT id,
    user_id,
    user_type,
    user_type_id,
    amount,
    balance_before,
    balance_after,
    (metadata ->> 'reason'::text) AS reason,
    (metadata ->> 'adminUserId'::text) AS admin_user_id,
    ip_address,
    created_at
   FROM public.token_transaction t
  WHERE ((type)::text = 'MANUAL_ADJUSTMENT'::text)
  ORDER BY created_at DESC;


--
-- Name: token_balance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.token_balance (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id character varying(255) NOT NULL,
    user_type character varying(50) NOT NULL,
    user_type_id character varying(255) NOT NULL,
    balance integer DEFAULT 0 NOT NULL,
    total_purchased integer DEFAULT 0 NOT NULL,
    total_consumed integer DEFAULT 0 NOT NULL,
    total_granted integer DEFAULT 0 NOT NULL,
    last_purchase_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT token_balance_balance_check CHECK ((balance >= 0)),
    CONSTRAINT token_balance_user_type_check CHECK (((user_type)::text = ANY ((ARRAY['CUSTOMER'::character varying, 'ARTIST'::character varying, 'ADMIN'::character varying])::text[])))
);


--
-- Name: token_balance token_balance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_balance
    ADD CONSTRAINT token_balance_pkey PRIMARY KEY (id);


--
-- Name: token_balance token_balance_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_balance
    ADD CONSTRAINT token_balance_user_id_key UNIQUE (user_id);


--
-- Name: token_transaction token_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_transaction
    ADD CONSTRAINT token_transaction_pkey PRIMARY KEY (id);


--
-- Name: idx_balance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_balance ON public.token_balance USING btree (balance);


--
-- Name: idx_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_created_at ON public.token_balance USING btree (created_at);


--
-- Name: idx_token_transaction_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_token_transaction_created_at ON public.token_transaction USING btree (created_at);


--
-- Name: idx_token_transaction_metadata_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_token_transaction_metadata_gin ON public.token_transaction USING gin (metadata);


--
-- Name: idx_token_transaction_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_token_transaction_status ON public.token_transaction USING btree (status);


--
-- Name: idx_token_transaction_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_token_transaction_type ON public.token_transaction USING btree (type);


--
-- Name: idx_token_transaction_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_token_transaction_user_id ON public.token_transaction USING btree (user_id);


--
-- Name: idx_token_transaction_user_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_token_transaction_user_type_id ON public.token_transaction USING btree (user_type_id);


--
-- Name: idx_transaction_audit; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transaction_audit ON public.token_transaction USING btree (created_at, user_id, type, status);


--
-- Name: idx_user_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_type ON public.token_balance USING btree (user_type);


--
-- Name: idx_user_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_type_id ON public.token_balance USING btree (user_type_id);


--
-- Name: token_balance update_token_balance_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_token_balance_updated_at BEFORE UPDATE ON public.token_balance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: token_transaction update_token_transaction_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_token_transaction_updated_at BEFORE UPDATE ON public.token_transaction FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- PostgreSQL database dump complete
--

