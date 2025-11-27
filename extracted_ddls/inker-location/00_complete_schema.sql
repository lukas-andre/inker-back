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
-- Name: AddressType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AddressType" AS ENUM (
    'HOME',
    'DEPARTMENT',
    'STUDIO',
    'OFFICE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: artist_location; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artist_location (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    address1 character varying(100) NOT NULL,
    short_address1 character varying(100),
    address2 character varying(50) NOT NULL,
    address3 character varying(50),
    address_type public."AddressType" DEFAULT 'HOME'::public."AddressType" NOT NULL,
    state character varying(100),
    city character varying(100),
    country character varying(20),
    formatted_address character varying(255),
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    viewport jsonb,
    location public.geography(Point,4326),
    name character varying NOT NULL,
    profile_thumbnail character varying,
    google_place_id character varying,
    location_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    artist_id uuid
);


--
-- Name: event_location; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_location (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    address1 character varying(100) NOT NULL,
    short_address1 character varying(100),
    address2 character varying(50) NOT NULL,
    address3 character varying(50),
    address_type public."AddressType" DEFAULT 'HOME'::public."AddressType" NOT NULL,
    state character varying(100),
    city character varying(100),
    country character varying(20),
    formatted_address character varying(255),
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    viewport jsonb,
    location public.geography(Point,4326)
);


--
-- Name: artist_location PK_86c4d78b72729fe4f03e468ef55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_location
    ADD CONSTRAINT "PK_86c4d78b72729fe4f03e468ef55" PRIMARY KEY (id);


--
-- Name: event_location PK_ff5c43e186f7faf15a975004d76; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_location
    ADD CONSTRAINT "PK_ff5c43e186f7faf15a975004d76" PRIMARY KEY (id);


--
-- Name: IDX_1ce699acff5d40d1b7ce70b1fc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_1ce699acff5d40d1b7ce70b1fc" ON public.artist_location USING gist (location);


--
-- Name: IDX_32b296abf35bf4c43f52239ba5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_32b296abf35bf4c43f52239ba5" ON public.event_location USING gist (location);


--
-- PostgreSQL database dump complete
--

