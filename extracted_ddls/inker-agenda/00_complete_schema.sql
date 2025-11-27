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
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: consent_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.consent_type_enum AS ENUM (
    'GENERAL_TERMS',
    'TATTOO_CONSENT',
    'IMAGE_RELEASE',
    'OTHER'
);


--
-- Name: penalty_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.penalty_status_enum AS ENUM (
    'pending',
    'applied',
    'waived'
);


--
-- Name: penalty_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.penalty_type_enum AS ENUM (
    'fixed_fee',
    'percentage',
    'reputation_points'
);


--
-- Name: quotation_appealed_reason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quotation_appealed_reason AS ENUM (
    'date_change',
    'price_change',
    'design_change',
    'other'
);


--
-- Name: quotation_artist_reject_reason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quotation_artist_reject_reason AS ENUM (
    'scheduling_conflict',
    'artistic_disagreement',
    'insufficient_details',
    'beyond_expertise',
    'other'
);


--
-- Name: quotation_canceled_by; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quotation_canceled_by AS ENUM (
    'customer',
    'system'
);


--
-- Name: quotation_customer_cancel_reason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quotation_customer_cancel_reason AS ENUM (
    'change_of_mind',
    'found_another_artist',
    'financial_reasons',
    'personal_reasons',
    'other'
);


--
-- Name: quotation_customer_reject_reason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quotation_customer_reject_reason AS ENUM (
    'too_expensive',
    'not_what_i_wanted',
    'changed_my_mind',
    'found_another_artist',
    'other'
);


--
-- Name: quotation_offer_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quotation_offer_status AS ENUM (
    'SUBMITTED',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN'
);


--
-- Name: quotation_reject_by; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quotation_reject_by AS ENUM (
    'customer',
    'artist',
    'system'
);


--
-- Name: quotation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quotation_status AS ENUM (
    'pending',
    'quoted',
    'accepted',
    'rejected',
    'appealed',
    'canceled',
    'open'
);


--
-- Name: quotation_system_cancel_reason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quotation_system_cancel_reason AS ENUM (
    'not_attended',
    'system_timeout'
);


--
-- Name: quotation_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quotation_type AS ENUM (
    'DIRECT',
    'OPEN'
);


--
-- Name: quotation_user_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quotation_user_type AS ENUM (
    'customer',
    'artist',
    'admin',
    'system'
);


--
-- Name: trigger_set_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_set_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agenda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agenda (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id character varying NOT NULL,
    artist_id character varying DEFAULT '0'::character varying NOT NULL,
    working_days jsonb DEFAULT '["1", "2", "3", "4", "5"]'::jsonb NOT NULL,
    working_hours_start time without time zone,
    working_hours_end time without time zone,
    public boolean DEFAULT false NOT NULL,
    open boolean DEFAULT true NOT NULL,
    deleted_at timestamp without time zone
);


--
-- Name: agenda_event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agenda_event (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    customer_id character varying,
    title character varying NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    color character varying NOT NULL,
    info character varying NOT NULL,
    notification boolean DEFAULT false NOT NULL,
    done boolean DEFAULT false NOT NULL,
    status character varying DEFAULT 'scheduled'::character varying NOT NULL,
    work_evidence jsonb,
    notes text,
    preparation_time integer,
    cleanup_time integer,
    customer_notified boolean DEFAULT false NOT NULL,
    deleted_at timestamp without time zone,
    quotation_id character varying,
    agenda_id uuid,
    review_id uuid,
    status_log jsonb,
    reschedule_log jsonb,
    messages jsonb DEFAULT '[]'::jsonb,
    reminder_sent jsonb DEFAULT '{}'::jsonb
);


--
-- Name: COLUMN agenda_event.review_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.agenda_event.review_id IS 'review id from review database';


--
-- Name: agenda_invitation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agenda_invitation (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    invitee_id character varying NOT NULL,
    status character varying NOT NULL,
    event_id uuid
);


--
-- Name: agenda_unavailable_time; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agenda_unavailable_time (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    agenda_id uuid NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    reason character varying,
    deleted_at timestamp without time zone
);


--
-- Name: cancellation_penalty; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cancellation_penalty (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    type public.penalty_type_enum NOT NULL,
    amount numeric(10,2),
    reputation_points integer,
    metadata jsonb,
    status public.penalty_status_enum DEFAULT 'pending'::public.penalty_status_enum NOT NULL,
    agenda_id uuid,
    quotation_id uuid
);


--
-- Name: TABLE cancellation_penalty; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.cancellation_penalty IS 'Stores records of penalties applied due to event cancellations.';


--
-- Name: COLUMN cancellation_penalty.event_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cancellation_penalty.event_id IS 'The ID of the event that was cancelled.';


--
-- Name: COLUMN cancellation_penalty.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cancellation_penalty.user_id IS 'The ID of the user (artist or customer) who incurred the penalty.';


--
-- Name: COLUMN cancellation_penalty.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cancellation_penalty.type IS 'The type of penalty (e.g., fixed_fee, percentage, reputation_points).';


--
-- Name: COLUMN cancellation_penalty.amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cancellation_penalty.amount IS 'The monetary amount of the penalty, if applicable.';


--
-- Name: COLUMN cancellation_penalty.reputation_points; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cancellation_penalty.reputation_points IS 'The number of reputation points deducted or awarded, if applicable.';


--
-- Name: COLUMN cancellation_penalty.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cancellation_penalty.metadata IS 'JSONB field to store additional context about the penalty (cancellation time, user role, etc.).';


--
-- Name: COLUMN cancellation_penalty.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cancellation_penalty.status IS 'The current status of the penalty (e.g., pending, applied, waived).';


--
-- Name: COLUMN cancellation_penalty.agenda_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cancellation_penalty.agenda_id IS 'The ID of the agenda associated with the event, for easier grouping.';


--
-- Name: COLUMN cancellation_penalty.quotation_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.cancellation_penalty.quotation_id IS 'The ID of the quotation associated with the event, for context.';


--
-- Name: form_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    content jsonb NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    consent_type public.consent_type_enum NOT NULL,
    artist_id uuid NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: quotation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotation (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    customer_id character varying NOT NULL,
    artist_id character varying,
    description character varying NOT NULL,
    reference_images jsonb,
    proposed_designs jsonb,
    status public.quotation_status DEFAULT 'pending'::public.quotation_status NOT NULL,
    estimated_cost jsonb,
    response_date timestamp without time zone,
    appointment_date timestamp without time zone,
    appointment_duration integer,
    reject_by public.quotation_reject_by,
    customer_reject_reason public.quotation_customer_reject_reason,
    artist_reject_reason public.quotation_artist_reject_reason,
    reject_reason_details text,
    rejected_date timestamp without time zone,
    appealed_reason public.quotation_appealed_reason,
    appealed_date timestamp without time zone,
    canceled_by public.quotation_canceled_by,
    customer_cancel_reason public.quotation_customer_cancel_reason,
    system_cancel_reason public.quotation_system_cancel_reason,
    cancel_reason_details text,
    canceled_date timestamp without time zone,
    last_updated_by character varying,
    last_updated_by_user_type public.quotation_user_type,
    read_by_artist boolean DEFAULT false NOT NULL,
    read_by_customer boolean DEFAULT false NOT NULL,
    artist_read_at timestamp without time zone,
    customer_read_at timestamp without time zone,
    stencil_id character varying,
    type public.quotation_type DEFAULT 'DIRECT'::public.quotation_type NOT NULL,
    customer_lat double precision,
    customer_lon double precision,
    customer_travel_radius_km integer,
    tattoo_design_cache_id uuid,
    tattoo_design_image_url text,
    min_budget jsonb,
    max_budget jsonb,
    reference_budget jsonb,
    generated_image_id character varying,
    CONSTRAINT chk_quotation_tattoo_cache_for_open CHECK ((((tattoo_design_cache_id IS NULL) AND (tattoo_design_image_url IS NULL)) OR (type = 'OPEN'::public.quotation_type)))
);


--
-- Name: COLUMN quotation.last_updated_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quotation.last_updated_by IS 'User ID of the last person who updated the quotation';


--
-- Name: COLUMN quotation.tattoo_design_cache_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quotation.tattoo_design_cache_id IS 'Reference to the AI-generated tattoo design cache entity.';


--
-- Name: COLUMN quotation.tattoo_design_image_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quotation.tattoo_design_image_url IS 'Specific image URL selected from the referenced tattoo design cache.';


--
-- Name: quotation_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotation_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    previous_status character varying NOT NULL,
    new_status character varying NOT NULL,
    changed_at timestamp without time zone DEFAULT now() NOT NULL,
    changed_by uuid NOT NULL,
    changed_by_user_type character varying NOT NULL,
    previous_estimated_cost jsonb,
    new_estimated_cost jsonb,
    previous_appointment_date timestamp without time zone,
    new_appointment_date timestamp without time zone,
    previous_appointment_duration integer,
    new_appointment_duration integer,
    appealed_reason character varying,
    rejection_reason text,
    cancellation_reason text,
    additional_details text,
    last_updated_by uuid,
    last_updated_by_user_type public.quotation_user_type,
    quotation_id uuid,
    previous_tattoo_design_cache_id uuid,
    new_tattoo_design_cache_id uuid,
    previous_tattoo_design_image_url text,
    new_tattoo_design_image_url text
);


--
-- Name: COLUMN quotation_history.last_updated_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quotation_history.last_updated_by IS 'User ID of the last person who updated the quotation';


--
-- Name: COLUMN quotation_history.previous_tattoo_design_cache_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quotation_history.previous_tattoo_design_cache_id IS 'Previous value of tattoo_design_cache_id before the change.';


--
-- Name: COLUMN quotation_history.new_tattoo_design_cache_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quotation_history.new_tattoo_design_cache_id IS 'New value of tattoo_design_cache_id after the change.';


--
-- Name: COLUMN quotation_history.previous_tattoo_design_image_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quotation_history.previous_tattoo_design_image_url IS 'Previous value of tattoo_design_image_url before the change.';


--
-- Name: COLUMN quotation_history.new_tattoo_design_image_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quotation_history.new_tattoo_design_image_url IS 'New value of tattoo_design_image_url after the change.';


--
-- Name: quotation_offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotation_offers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    quotation_id uuid NOT NULL,
    artist_id uuid NOT NULL,
    estimated_cost jsonb,
    estimated_duration integer,
    message text,
    status public.quotation_offer_status DEFAULT 'SUBMITTED'::public.quotation_offer_status NOT NULL,
    messages jsonb DEFAULT '[]'::jsonb,
    estimated_date timestamp without time zone DEFAULT now()
);


--
-- Name: COLUMN quotation_offers.messages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.quotation_offers.messages IS 'Stores the chat history (array of OfferMessage objects) between the customer and the artist for this specific offer.';


--
-- Name: signed_consents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signed_consents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    form_template_id uuid,
    signed_data jsonb NOT NULL,
    digital_signature text NOT NULL,
    signed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_id uuid NOT NULL,
    ip_address character varying(45),
    user_agent text
);


--
-- Name: agenda_event PK_2d1f04ea60f7ca9b758000ad5dc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_event
    ADD CONSTRAINT "PK_2d1f04ea60f7ca9b758000ad5dc" PRIMARY KEY (id);


--
-- Name: agenda PK_49397cfc20589bebaac8b43251d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda
    ADD CONSTRAINT "PK_49397cfc20589bebaac8b43251d" PRIMARY KEY (id);


--
-- Name: quotation PK_596c572d5858492d10d8cf5383d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation
    ADD CONSTRAINT "PK_596c572d5858492d10d8cf5383d" PRIMARY KEY (id);


--
-- Name: agenda_invitation PK_90721b8d5e50986a26a8830b6fd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_invitation
    ADD CONSTRAINT "PK_90721b8d5e50986a26a8830b6fd" PRIMARY KEY (id);


--
-- Name: quotation_history PK_a14a0b9bfa5bb74d3a46c0a7ee6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_history
    ADD CONSTRAINT "PK_a14a0b9bfa5bb74d3a46c0a7ee6" PRIMARY KEY (id);


--
-- Name: agenda_unavailable_time PK_e37b45f59e0f89bf7b21c93455b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_unavailable_time
    ADD CONSTRAINT "PK_e37b45f59e0f89bf7b21c93455b" PRIMARY KEY (id);


--
-- Name: quotation_offers PK_quotation_offers_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_offers
    ADD CONSTRAINT "PK_quotation_offers_id" PRIMARY KEY (id);


--
-- Name: agenda_invitation REL_a4be6d79f7ac6e0ff252361f5f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_invitation
    ADD CONSTRAINT "REL_a4be6d79f7ac6e0ff252361f5f" UNIQUE (event_id);


--
-- Name: cancellation_penalty cancellation_penalty_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cancellation_penalty
    ADD CONSTRAINT cancellation_penalty_pkey PRIMARY KEY (id);


--
-- Name: form_templates form_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_templates
    ADD CONSTRAINT form_templates_pkey PRIMARY KEY (id);


--
-- Name: signed_consents signed_consents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signed_consents
    ADD CONSTRAINT signed_consents_pkey PRIMARY KEY (id);


--
-- Name: IDX_0819be156d36ead6e3a10d7391; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_0819be156d36ead6e3a10d7391" ON public.agenda_event USING btree (quotation_id);


--
-- Name: IDX_085cd03c647cd3f2f2045dbbd0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_085cd03c647cd3f2f2045dbbd0" ON public.agenda_unavailable_time USING btree (start_date);


--
-- Name: IDX_50ece0401edd36c92ecfa43d5d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_50ece0401edd36c92ecfa43d5d" ON public.agenda_event USING btree (start_date);


--
-- Name: IDX_51cea2e92a1684c6f5dec0be77; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_51cea2e92a1684c6f5dec0be77" ON public.agenda_event USING btree (customer_id);


--
-- Name: IDX_5ad973140c6162b87c4780477c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_5ad973140c6162b87c4780477c" ON public.agenda_event USING btree (end_date);


--
-- Name: IDX_703dc0714a96b3a6872d0978a1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_703dc0714a96b3a6872d0978a1" ON public.agenda_event USING btree (start_date, end_date);


--
-- Name: IDX_76f0dc9ea1b280b659485e1c56; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_76f0dc9ea1b280b659485e1c56" ON public.agenda_unavailable_time USING btree (end_date);


--
-- Name: IDX_95663d2c16f5445a1b677d5482; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_95663d2c16f5445a1b677d5482" ON public.quotation USING btree (artist_id);


--
-- Name: IDX_9b0f71bc992eacc3909e1f3866; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_9b0f71bc992eacc3909e1f3866" ON public.agenda_unavailable_time USING btree (start_date, end_date);


--
-- Name: IDX_a4be6d79f7ac6e0ff252361f5f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_a4be6d79f7ac6e0ff252361f5f" ON public.agenda_invitation USING btree (event_id);


--
-- Name: IDX_a9d713d3bd3c54be56263cb76e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_a9d713d3bd3c54be56263cb76e" ON public.quotation USING btree (customer_id);


--
-- Name: IDX_c9083b6cdc404ea78948b7b625; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_c9083b6cdc404ea78948b7b625" ON public.agenda USING btree (artist_id);


--
-- Name: IDX_quotation_offers_artist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_quotation_offers_artist_id" ON public.quotation_offers USING btree (artist_id);


--
-- Name: IDX_quotation_offers_quotation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_quotation_offers_quotation_id" ON public.quotation_offers USING btree (quotation_id);


--
-- Name: idx_agenda_event_agenda_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agenda_event_agenda_dates ON public.agenda_event USING btree (agenda_id, start_date, end_date);


--
-- Name: idx_agenda_event_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agenda_event_deleted_at ON public.agenda_event USING btree (deleted_at);


--
-- Name: idx_agenda_event_reminder_sent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agenda_event_reminder_sent ON public.agenda_event USING gin (reminder_sent);


--
-- Name: idx_agenda_event_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agenda_event_status ON public.agenda_event USING btree (status);


--
-- Name: idx_agenda_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agenda_id ON public.agenda_event USING btree (agenda_id);


--
-- Name: idx_form_templates_artist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_form_templates_artist_id ON public.form_templates USING btree (artist_id);


--
-- Name: idx_form_templates_consent_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_form_templates_consent_type ON public.form_templates USING btree (consent_type);


--
-- Name: idx_penalty_agenda_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_penalty_agenda_id ON public.cancellation_penalty USING btree (agenda_id);


--
-- Name: idx_penalty_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_penalty_event_id ON public.cancellation_penalty USING btree (event_id);


--
-- Name: idx_penalty_quotation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_penalty_quotation_id ON public.cancellation_penalty USING btree (quotation_id);


--
-- Name: idx_penalty_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_penalty_status ON public.cancellation_penalty USING btree (status);


--
-- Name: idx_penalty_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_penalty_type ON public.cancellation_penalty USING btree (type);


--
-- Name: idx_penalty_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_penalty_user_id ON public.cancellation_penalty USING btree (user_id);


--
-- Name: idx_quotation_appointment_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotation_appointment_date ON public.quotation USING btree (appointment_date);


--
-- Name: idx_quotation_artist_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotation_artist_status ON public.quotation USING btree (artist_id, status);


--
-- Name: idx_quotation_offer_artist_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotation_offer_artist_date ON public.quotation_offers USING btree (artist_id, estimated_date);


--
-- Name: idx_quotation_offer_estimated_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotation_offer_estimated_date ON public.quotation_offers USING btree (estimated_date);


--
-- Name: idx_quotation_offer_quotation_artist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotation_offer_quotation_artist ON public.quotation_offers USING btree (quotation_id, artist_id);


--
-- Name: idx_quotation_tattoo_design_cache_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotation_tattoo_design_cache_id ON public.quotation USING btree (tattoo_design_cache_id);


--
-- Name: idx_quotation_type_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotation_type_status ON public.quotation USING btree (type, status);


--
-- Name: idx_signed_consents_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signed_consents_event_id ON public.signed_consents USING btree (event_id);


--
-- Name: idx_signed_consents_form_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signed_consents_form_template_id ON public.signed_consents USING btree (form_template_id);


--
-- Name: idx_signed_consents_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signed_consents_user_id ON public.signed_consents USING btree (user_id);


--
-- Name: form_templates set_timestamp_form_templates; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_form_templates BEFORE UPDATE ON public.form_templates FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: quotation_history FK_17ee753f917de8c53ca06c6425f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_history
    ADD CONSTRAINT "FK_17ee753f917de8c53ca06c6425f" FOREIGN KEY (quotation_id) REFERENCES public.quotation(id);


--
-- Name: agenda_event FK_52830e038af1114957b8f95a507; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_event
    ADD CONSTRAINT "FK_52830e038af1114957b8f95a507" FOREIGN KEY (agenda_id) REFERENCES public.agenda(id);


--
-- Name: agenda_invitation FK_a4be6d79f7ac6e0ff252361f5f7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_invitation
    ADD CONSTRAINT "FK_a4be6d79f7ac6e0ff252361f5f7" FOREIGN KEY (event_id) REFERENCES public.agenda_event(id);


--
-- Name: agenda_unavailable_time FK_f8ca0c062bf614bbcb27172e890; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_unavailable_time
    ADD CONSTRAINT "FK_f8ca0c062bf614bbcb27172e890" FOREIGN KEY (agenda_id) REFERENCES public.agenda(id);


--
-- Name: quotation_offers FK_quotation_offers_quotation_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotation_offers
    ADD CONSTRAINT "FK_quotation_offers_quotation_id" FOREIGN KEY (quotation_id) REFERENCES public.quotation(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: signed_consents fk_event; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signed_consents
    ADD CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES public.agenda_event(id) ON DELETE CASCADE;


--
-- Name: signed_consents fk_form_template; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signed_consents
    ADD CONSTRAINT fk_form_template FOREIGN KEY (form_template_id) REFERENCES public.form_templates(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

