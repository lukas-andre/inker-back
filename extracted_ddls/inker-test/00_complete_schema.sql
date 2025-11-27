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
    'canceled'
);


--
-- Name: quotation_system_cancel_reason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quotation_system_cancel_reason AS ENUM (
    'not_attended',
    'system_timeout'
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
-- PostgreSQL database dump complete
--

