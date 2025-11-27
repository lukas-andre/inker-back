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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    activity_id integer NOT NULL,
    reaction_type character varying NOT NULL,
    activity_type character varying NOT NULL,
    reactions integer DEFAULT 0 NOT NULL
);


--
-- Name: reaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reaction (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    activity_id integer NOT NULL,
    activity_type character varying NOT NULL,
    reaction_type character varying NOT NULL,
    active boolean NOT NULL,
    location character varying NOT NULL,
    user_id integer NOT NULL,
    user_type_id integer NOT NULL,
    user_type character varying NOT NULL,
    profile_thumbnail character varying,
    username character varying NOT NULL
);


--
-- Name: activity PK_24625a1d6b1b089c8ae206fe467; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity
    ADD CONSTRAINT "PK_24625a1d6b1b089c8ae206fe467" PRIMARY KEY (id);


--
-- Name: reaction PK_41fbb346da22da4df129f14b11e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT "PK_41fbb346da22da4df129f14b11e" PRIMARY KEY (id);


--
-- Name: IDX_0e33ea8cf21e7355c152b18f2b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_0e33ea8cf21e7355c152b18f2b" ON public.reaction USING btree (activity_id);


--
-- Name: IDX_2230e00a30a1c3423ed26b5d08; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_2230e00a30a1c3423ed26b5d08" ON public.reaction USING btree (active);


--
-- Name: IDX_678281c99a36ba76bbcd4baa82; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_678281c99a36ba76bbcd4baa82" ON public.activity USING btree (activity_type);


--
-- Name: IDX_7c457b73b6917a019a31b9a8c8; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_7c457b73b6917a019a31b9a8c8" ON public.reaction USING btree (user_type_id);


--
-- Name: IDX_978c984f412d09b43304e41ae9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_978c984f412d09b43304e41ae9" ON public.reaction USING btree (user_id);


--
-- Name: IDX_ace7dee1643c316f016d8b8204; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ace7dee1643c316f016d8b8204" ON public.reaction USING btree (activity_type);


--
-- Name: IDX_f4d42df90549af0a27dcefb3a1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_f4d42df90549af0a27dcefb3a1" ON public.reaction USING btree (reaction_type);


--
-- PostgreSQL database dump complete
--

