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
-- Name: comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    content character varying NOT NULL,
    location character varying,
    user_id character varying NOT NULL,
    user_type_id character varying NOT NULL,
    user_type character varying NOT NULL,
    parent_type character varying NOT NULL,
    parent_id character varying,
    username character varying NOT NULL,
    profile_thumbnail character varying,
    deleted_at timestamp without time zone
);


--
-- Name: post; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    content character varying NOT NULL,
    location character varying,
    user_id character varying NOT NULL,
    user_type_id character varying NOT NULL,
    user_type character varying NOT NULL,
    username character varying NOT NULL,
    profile_thumbnail character varying,
    multimedia jsonb,
    tags jsonb,
    genres jsonb,
    hidden boolean DEFAULT false NOT NULL,
    deleted_at timestamp without time zone
);


--
-- Name: comment PK_0b0e4bbc8415ec426f87f3a88e2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY (id);


--
-- Name: post PK_be5fda3aac270b134ff9c21cdee; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY (id);


--
-- Name: IDX_06786c179131975fef5fd26bfe; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_06786c179131975fef5fd26bfe" ON public.comment USING btree (location);


--
-- Name: IDX_3dd966611c859e2bb898763f4a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_3dd966611c859e2bb898763f4a" ON public.post USING btree (location);


--
-- Name: IDX_52378a74ae3724bcab44036645; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_52378a74ae3724bcab44036645" ON public.post USING btree (user_id);


--
-- Name: IDX_62ba03774e466effeeb171af50; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_62ba03774e466effeeb171af50" ON public.post USING btree (user_type);


--
-- Name: IDX_6f2e185b854c47a5f8dfae741a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_6f2e185b854c47a5f8dfae741a" ON public.post USING btree (user_type_id);


--
-- Name: IDX_7b65538426c45387905f0939a2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_7b65538426c45387905f0939a2" ON public.comment USING btree (parent_type);


--
-- Name: IDX_8bd8d0985c0d077c8129fb4a20; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_8bd8d0985c0d077c8129fb4a20" ON public.comment USING btree (parent_id);


--
-- Name: IDX_bbfe153fa60aa06483ed35ff4a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_bbfe153fa60aa06483ed35ff4a" ON public.comment USING btree (user_id);


--
-- Name: IDX_c5df8f9e8d8c44b3c3ddbdee28; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_c5df8f9e8d8c44b3c3ddbdee28" ON public.comment USING btree (user_type_id);


--
-- Name: IDX_f772ca433426f5104d3119ddd3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_f772ca433426f5104d3119ddd3" ON public.comment USING btree (user_type);


--
-- PostgreSQL database dump complete
--

