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
-- Name: reaction_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reaction_type_enum AS ENUM (
    'like',
    'dislike',
    'off'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: review; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    artist_id character varying NOT NULL,
    event_id character varying NOT NULL,
    value real,
    header character varying(30),
    content character varying,
    review_reactions jsonb DEFAULT '{"likes": 0, "dislikes": 0}'::jsonb NOT NULL,
    created_by character varying NOT NULL,
    display_name character varying NOT NULL,
    is_rated boolean DEFAULT false NOT NULL
);


--
-- Name: review_avg; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_avg (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    artist_id character varying NOT NULL,
    value real NOT NULL,
    detail jsonb DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "1.5": 0, "2.5": 0, "3.5": 0, "4.5": 0}'::jsonb NOT NULL,
    count integer DEFAULT 0 NOT NULL
);


--
-- Name: review_reaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_reaction (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    customer_id character varying NOT NULL,
    reaction_type public.reaction_type_enum NOT NULL,
    review_id character varying NOT NULL
);


--
-- Name: review PK_2e4299a343a81574217255c00ca; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY (id);


--
-- Name: review_reaction PK_7e099e5dc661aed762a9554c02f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_reaction
    ADD CONSTRAINT "PK_7e099e5dc661aed762a9554c02f" PRIMARY KEY (id);


--
-- Name: review_avg PK_c7cf0ad3df57a93c8d47bbf750b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_avg
    ADD CONSTRAINT "PK_c7cf0ad3df57a93c8d47bbf750b" PRIMARY KEY (id);


--
-- Name: IDX_005b84b7e7dd19d28f1c36eb7c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_005b84b7e7dd19d28f1c36eb7c" ON public.review USING btree (event_id);


--
-- Name: IDX_66bf56ba69663e8d8aeac98c6a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_66bf56ba69663e8d8aeac98c6a" ON public.review USING btree (artist_id);


--
-- Name: IDX_8112176e132dfb72c2327a6722; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_8112176e132dfb72c2327a6722" ON public.review USING btree (artist_id, event_id);


--
-- Name: IDX_a563b6be744b9227034603ea8e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_a563b6be744b9227034603ea8e" ON public.review_reaction USING btree (review_id);


--
-- Name: IDX_c9b1734cc444c093517d27ae6b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_c9b1734cc444c093517d27ae6b" ON public.review_avg USING btree (artist_id);


--
-- Name: IDX_e054028c75449a8ecae0fcf21b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_e054028c75449a8ecae0fcf21b" ON public.review_reaction USING btree (customer_id);


--
-- PostgreSQL database dump complete
--

