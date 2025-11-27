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
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: tattoo_cache_update_search_vector(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tattoo_cache_update_search_vector() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.source_text, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.translated_text, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.metadata, '')), 'C');
  RETURN NEW;
END;
$$;


--
-- Name: tattoo_cache_update_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tattoo_cache_update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: tattoo_design_update_search_vector(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tattoo_design_update_search_vector() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.user_query, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.style, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.prompt, '')), 'C');
  RETURN NEW;
END;
$$;


--
-- Name: tattoo_design_update_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tattoo_design_update_timestamp() RETURNS trigger
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
-- Name: tattoo_design_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tattoo_design_cache (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_query text NOT NULL,
    style text,
    image_urls text[] NOT NULL,
    prompt text,
    metadata jsonb,
    search_vector tsvector,
    usage_count integer DEFAULT 1 NOT NULL,
    is_favorite boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tattoo_design_cache tattoo_design_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tattoo_design_cache
    ADD CONSTRAINT tattoo_design_cache_pkey PRIMARY KEY (id);


--
-- Name: idx_tattoo_design_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tattoo_design_created_at ON public.tattoo_design_cache USING btree (created_at);


--
-- Name: idx_tattoo_design_favorite; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tattoo_design_favorite ON public.tattoo_design_cache USING btree (is_favorite) WHERE (is_favorite = true);


--
-- Name: idx_tattoo_design_search_vector; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tattoo_design_search_vector ON public.tattoo_design_cache USING gin (search_vector);


--
-- Name: idx_tattoo_design_style; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tattoo_design_style ON public.tattoo_design_cache USING btree (style);


--
-- Name: idx_tattoo_design_usage_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tattoo_design_usage_count ON public.tattoo_design_cache USING btree (usage_count DESC);


--
-- Name: idx_tattoo_design_user_query; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tattoo_design_user_query ON public.tattoo_design_cache USING gin (user_query public.gin_trgm_ops);


--
-- Name: tattoo_design_cache tattoo_design_timestamp_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tattoo_design_timestamp_update BEFORE UPDATE ON public.tattoo_design_cache FOR EACH ROW EXECUTE FUNCTION public.tattoo_design_update_timestamp();


--
-- Name: tattoo_design_cache tattoo_design_vector_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tattoo_design_vector_update BEFORE INSERT OR UPDATE ON public.tattoo_design_cache FOR EACH ROW EXECUTE FUNCTION public.tattoo_design_update_search_vector();


--
-- PostgreSQL database dump complete
--

