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
-- Name: genrer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genrer (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    name character varying NOT NULL,
    created_by text
);


--
-- Name: genrer PK_8ace312a97fdc292323578bb158; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genrer
    ADD CONSTRAINT "PK_8ace312a97fdc292323578bb158" PRIMARY KEY (id);


--
-- Name: IDX_3a24e6737df006b9aa30b76cca; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_3a24e6737df006b9aa30b76cca" ON public.genrer USING btree (name);


--
-- PostgreSQL database dump complete
--

