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
-- Name: followed; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.followed (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_followed_id character varying NOT NULL,
    user_id character varying NOT NULL,
    user_type_id character varying NOT NULL,
    user_type character varying NOT NULL,
    username character varying NOT NULL,
    fullname character varying NOT NULL,
    profile_thumbnail character varying
);


--
-- Name: following; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.following (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_following_id character varying NOT NULL,
    user_id character varying NOT NULL,
    user_type_id character varying NOT NULL,
    user_type character varying NOT NULL,
    username character varying NOT NULL,
    fullname character varying NOT NULL,
    profile_thumbnail character varying
);


--
-- Name: followed PK_88316014cdc34a15b9a19772c5f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.followed
    ADD CONSTRAINT "PK_88316014cdc34a15b9a19772c5f" PRIMARY KEY (id);


--
-- Name: following PK_c76c6e044bdf76ecf8bfb82a645; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.following
    ADD CONSTRAINT "PK_c76c6e044bdf76ecf8bfb82a645" PRIMARY KEY (id);


--
-- Name: IDX_0cd95f68af8a5715869acb53ff; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_0cd95f68af8a5715869acb53ff" ON public.followed USING btree (user_followed_id);


--
-- Name: IDX_3ab90b492b1f2c3d8b8f61adbd; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_3ab90b492b1f2c3d8b8f61adbd" ON public.followed USING btree (user_id);


--
-- Name: IDX_4a5bd9db5bd73571f8c4571771; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_4a5bd9db5bd73571f8c4571771" ON public.following USING btree (user_id);


--
-- Name: IDX_70994ee485be5c9afd8fa864bb; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_70994ee485be5c9afd8fa864bb" ON public.following USING btree (user_following_id);


--
-- Name: IDX_d2374b9535a0e063e8e442dec2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_d2374b9535a0e063e8e442dec2" ON public.following USING btree (user_type_id);


--
-- Name: IDX_ea71d55e5f089a426913df2bd8; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ea71d55e5f089a426913df2bd8" ON public.followed USING btree (user_type_id);


--
-- PostgreSQL database dump complete
--

