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
-- Name: job_type_key; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.job_type_key AS ENUM (
    'EVENT_CREATED',
    'EVENT_CANCELED',
    'EVENT_REMINDER',
    'EVENT_UPDATED',
    'EVENT_STATUS_CHANGED',
    'RSVP_ACCEPTED',
    'RSVP_DECLINED',
    'RSVP_UNSCHEDULABLE',
    'QUOTATION_CREATED',
    'QUOTATION_REPLIED',
    'QUOTATION_ACCEPTED',
    'QUOTATION_REJECTED',
    'QUOTATION_APPEALED',
    'QUOTATION_CANCELED',
    'ACCOUNT_VERIFICATION_CODE'
);


--
-- Name: user_fcm_tokens_device_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_fcm_tokens_device_type_enum AS ENUM (
    'android',
    'ios',
    'web'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id character varying NOT NULL,
    title character varying NOT NULL,
    body character varying NOT NULL,
    type public.job_type_key NOT NULL,
    data jsonb NOT NULL,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: user_fcm_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_fcm_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id character varying NOT NULL,
    token character varying NOT NULL,
    device_type public.user_fcm_tokens_device_type_enum NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    last_used_at timestamp without time zone
);


--
-- Name: notifications PK_6a72c3c0f683f6462415e653c3a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY (id);


--
-- Name: user_fcm_tokens PK_f8088ed7e1116e01a4033b6ca76; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_fcm_tokens
    ADD CONSTRAINT "PK_f8088ed7e1116e01a4033b6ca76" PRIMARY KEY (id);


--
-- Name: IDX_e66818fd4f5952a132c6bd0e68; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_e66818fd4f5952a132c6bd0e68" ON public.user_fcm_tokens USING btree (user_id, token);


--
-- PostgreSQL database dump complete
--

