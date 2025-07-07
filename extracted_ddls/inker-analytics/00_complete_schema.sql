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
-- Name: content_metrics_content_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.content_metrics_content_type_enum AS ENUM (
    'stencil',
    'work',
    'artist_profile'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: artist_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artist_metrics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    artist_id uuid NOT NULL,
    metrics jsonb DEFAULT '{"views": {"count": 0, "uniqueCount": 0}}'::jsonb NOT NULL
);


--
-- Name: artist_metrics_viewers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artist_metrics_viewers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    metrics_id uuid NOT NULL,
    viewer_key character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: content_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_metrics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    content_id uuid NOT NULL,
    content_type public.content_metrics_content_type_enum NOT NULL,
    metrics jsonb DEFAULT '{"views": {"count": 0, "uniqueCount": 0}}'::jsonb NOT NULL
);


--
-- Name: content_metrics_viewers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_metrics_viewers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    metrics_id uuid NOT NULL,
    viewer_key character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: query-result-cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."query-result-cache" (
    id integer NOT NULL,
    identifier character varying,
    "time" bigint NOT NULL,
    duration integer NOT NULL,
    query text NOT NULL,
    result text NOT NULL
);


--
-- Name: query-result-cache_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."query-result-cache_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: query-result-cache_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."query-result-cache_id_seq" OWNED BY public."query-result-cache".id;


--
-- Name: query-result-cache id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."query-result-cache" ALTER COLUMN id SET DEFAULT nextval('public."query-result-cache_id_seq"'::regclass);


--
-- Name: artist_metrics PK_078efd97d1462740448f8b7ef22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_metrics
    ADD CONSTRAINT "PK_078efd97d1462740448f8b7ef22" PRIMARY KEY (id);


--
-- Name: content_metrics_viewers PK_0fc8d51af82bd3a8c78d3af155e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_metrics_viewers
    ADD CONSTRAINT "PK_0fc8d51af82bd3a8c78d3af155e" PRIMARY KEY (id);


--
-- Name: artist_metrics_viewers PK_66335507e24927bf9ef744cb6b4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_metrics_viewers
    ADD CONSTRAINT "PK_66335507e24927bf9ef744cb6b4" PRIMARY KEY (id);


--
-- Name: query-result-cache PK_6a98f758d8bfd010e7e10ffd3d3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."query-result-cache"
    ADD CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY (id);


--
-- Name: content_metrics PK_ae4a61c74a5142e2ec754147141; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_metrics
    ADD CONSTRAINT "PK_ae4a61c74a5142e2ec754147141" PRIMARY KEY (id);


--
-- Name: IDX_1d457c048def92e36e7368b10f; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_1d457c048def92e36e7368b10f" ON public.artist_metrics_viewers USING btree (metrics_id, viewer_key);


--
-- Name: IDX_45549bf4dbca82611ce8c94804; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_45549bf4dbca82611ce8c94804" ON public.content_metrics USING btree (content_id, content_type);


--
-- Name: IDX_6acfaaaf9428a46acea202825b; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_6acfaaaf9428a46acea202825b" ON public.content_metrics_viewers USING btree (metrics_id, viewer_key);


--
-- Name: IDX_f96f80047970cd4d6cb8e9ddb0; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_f96f80047970cd4d6cb8e9ddb0" ON public.artist_metrics USING btree (artist_id);


--
-- Name: content_metrics_viewers FK_0e40fda1c79da2bb9edd3e818b5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_metrics_viewers
    ADD CONSTRAINT "FK_0e40fda1c79da2bb9edd3e818b5" FOREIGN KEY (metrics_id) REFERENCES public.content_metrics(id) ON DELETE CASCADE;


--
-- Name: artist_metrics_viewers FK_b7b49edbf1b02ccbee4d82868df; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_metrics_viewers
    ADD CONSTRAINT "FK_b7b49edbf1b02ccbee4d82868df" FOREIGN KEY (metrics_id) REFERENCES public.artist_metrics(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

