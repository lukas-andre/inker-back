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
-- Name: service_name; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.service_name AS ENUM (
    'Barber',
    'Tattoo Artist'
);


--
-- Name: stencils_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.stencils_status_enum AS ENUM (
    'AVAILABLE',
    'SOLD',
    'USED'
);


--
-- Name: works_source_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.works_source_enum AS ENUM (
    'APP',
    'EXTERNAL'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: artist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artist (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id character varying NOT NULL,
    username character varying NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    short_description text,
    profile_thumbnail character varying,
    "profileThumbnailVersion" integer DEFAULT 0 NOT NULL,
    rating numeric(3,1) DEFAULT '0'::numeric NOT NULL,
    studio_photo character varying,
    "studioPhotoVersion" integer DEFAULT 0 NOT NULL,
    deleted_at timestamp without time zone,
    works_count integer DEFAULT 0 NOT NULL,
    stencils_count integer DEFAULT 0 NOT NULL,
    visible_works_count integer DEFAULT 0 NOT NULL,
    visible_stencils_count integer DEFAULT 0 NOT NULL,
    contact_id uuid
);


--
-- Name: COLUMN artist.rating; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.artist.rating IS 'Artist rating from 0.0 to 5.0';


--
-- Name: COLUMN artist.works_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.artist.works_count IS 'Count of all works (including hidden)';


--
-- Name: COLUMN artist.stencils_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.artist.stencils_count IS 'Count of all stencils (including hidden)';


--
-- Name: COLUMN artist.visible_works_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.artist.visible_works_count IS 'Count of visible works only (is_hidden=false)';


--
-- Name: COLUMN artist.visible_stencils_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.artist.visible_stencils_count IS 'Count of visible stencils only (is_hidden=false)';


--
-- Name: artist_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artist_services (
    artist_id uuid NOT NULL,
    service_id uuid NOT NULL
);


--
-- Name: artist_styles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artist_styles (
    artist_id uuid NOT NULL,
    style_name character varying NOT NULL,
    proficiency_level integer DEFAULT 3 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: artist_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artist_tags (
    artist_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


--
-- Name: contact; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    email character varying NOT NULL,
    phone character varying NOT NULL,
    phone_dial_code character varying NOT NULL,
    phone_country_iso_code character varying NOT NULL
);


--
-- Name: interactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id character varying NOT NULL,
    interaction_type character varying NOT NULL,
    entity_type character varying NOT NULL,
    entity_id character varying NOT NULL
);


--
-- Name: service; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    name public.service_name NOT NULL,
    description character varying
);


--
-- Name: stencil_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stencil_tags (
    stencil_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


--
-- Name: stencils; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stencils (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    artist_id uuid NOT NULL,
    title character varying NOT NULL,
    description text,
    image_url character varying NOT NULL,
    image_id character varying(40) NOT NULL,
    image_version integer DEFAULT 0 NOT NULL,
    thumbnail_url character varying,
    thumbnail_version integer DEFAULT 0 NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    order_position integer DEFAULT 0 NOT NULL,
    price numeric(10,2),
    status public.stencils_status_enum DEFAULT 'AVAILABLE'::public.stencils_status_enum NOT NULL,
    is_hidden boolean DEFAULT false NOT NULL,
    tsv tsvector NOT NULL,
    dimensions jsonb,
    recommended_placements text DEFAULT '[]'::text,
    estimated_time integer,
    is_customizable boolean DEFAULT false,
    is_downloadable boolean DEFAULT false,
    is_available boolean DEFAULT false,
    license text,
    license_url text,
    deleted_at timestamp without time zone
);


--
-- Name: tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tag (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    name character varying NOT NULL,
    created_by text
);


--
-- Name: work_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_tags (
    work_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


--
-- Name: works; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.works (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    artist_id uuid NOT NULL,
    title character varying NOT NULL,
    description text,
    image_id character varying,
    image_url character varying NOT NULL,
    image_version integer DEFAULT 0 NOT NULL,
    thumbnail_url character varying,
    thumbnail_version integer DEFAULT 0 NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    order_position integer DEFAULT 0 NOT NULL,
    source public.works_source_enum DEFAULT 'EXTERNAL'::public.works_source_enum NOT NULL,
    is_hidden boolean DEFAULT false NOT NULL,
    tsv tsvector NOT NULL,
    deleted_at timestamp without time zone
);


--
-- Name: contact PK_2cbbe00f59ab6b3bb5b8d19f989; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT "PK_2cbbe00f59ab6b3bb5b8d19f989" PRIMARY KEY (id);


--
-- Name: stencils PK_37b0357f453237217b664b0fe3e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stencils
    ADD CONSTRAINT "PK_37b0357f453237217b664b0fe3e" PRIMARY KEY (id);


--
-- Name: artist_styles PK_4a2907722f47519040b7f1e7bee; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_styles
    ADD CONSTRAINT "PK_4a2907722f47519040b7f1e7bee" PRIMARY KEY (artist_id, style_name);


--
-- Name: artist PK_55b76e71568b5db4d01d3e394ed; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist
    ADD CONSTRAINT "PK_55b76e71568b5db4d01d3e394ed" PRIMARY KEY (id);


--
-- Name: service PK_85a21558c006647cd76fdce044b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service
    ADD CONSTRAINT "PK_85a21558c006647cd76fdce044b" PRIMARY KEY (id);


--
-- Name: tag PK_8e4052373c579afc1471f526760; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY (id);


--
-- Name: interactions PK_911b7416a6671b4148b18c18ecb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interactions
    ADD CONSTRAINT "PK_911b7416a6671b4148b18c18ecb" PRIMARY KEY (id);


--
-- Name: works PK_a9ffbf516ba6e52604b29e5cce0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.works
    ADD CONSTRAINT "PK_a9ffbf516ba6e52604b29e5cce0" PRIMARY KEY (id);


--
-- Name: artist_services PK_bff6a5f79ac2d5001a4335eb613; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_services
    ADD CONSTRAINT "PK_bff6a5f79ac2d5001a4335eb613" PRIMARY KEY (artist_id, service_id);


--
-- Name: stencil_tags PK_dc74cb902062fe0d2240762eedd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stencil_tags
    ADD CONSTRAINT "PK_dc74cb902062fe0d2240762eedd" PRIMARY KEY (stencil_id, tag_id);


--
-- Name: work_tags PK_e2bdef324689c6f7a0f299a3c64; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_tags
    ADD CONSTRAINT "PK_e2bdef324689c6f7a0f299a3c64" PRIMARY KEY (work_id, tag_id);


--
-- Name: artist_tags PK_e9dd96c54c32a99d1f20131bbad; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_tags
    ADD CONSTRAINT "PK_e9dd96c54c32a99d1f20131bbad" PRIMARY KEY (artist_id, tag_id);


--
-- Name: artist REL_292e15f38dd57107d4ea27ea17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist
    ADD CONSTRAINT "REL_292e15f38dd57107d4ea27ea17" UNIQUE (contact_id);


--
-- Name: service UQ_7806a14d42c3244064b4a1706ca; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service
    ADD CONSTRAINT "UQ_7806a14d42c3244064b4a1706ca" UNIQUE (name);


--
-- Name: IDX_01528141d43ba0812a1bd51f1b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_01528141d43ba0812a1bd51f1b" ON public.artist USING btree (user_id);


--
-- Name: IDX_0865d329b903f353b0aeb61e1e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_0865d329b903f353b0aeb61e1e" ON public.stencil_tags USING btree (tag_id);


--
-- Name: IDX_0c0233d80c8b8a29c44add2a12; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_0c0233d80c8b8a29c44add2a12" ON public.stencils USING btree (tsv);


--
-- Name: IDX_444768e1db2128d9102c64d760; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_444768e1db2128d9102c64d760" ON public.artist USING btree (deleted_at);


--
-- Name: IDX_4a43ca7b9f68dc8ed1663994d7; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_4a43ca7b9f68dc8ed1663994d7" ON public.artist USING btree (rating);


--
-- Name: IDX_4d36169d3b489ea8bfdb9f9c09; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_4d36169d3b489ea8bfdb9f9c09" ON public.works USING btree (deleted_at);


--
-- Name: IDX_50ada619efd80a6abc56401fee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_50ada619efd80a6abc56401fee" ON public.works USING btree (tsv);


--
-- Name: IDX_55598cd484850a747685c78723; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_55598cd484850a747685c78723" ON public.work_tags USING btree (tag_id);


--
-- Name: IDX_59962fa0fe4a491273c402e93f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_59962fa0fe4a491273c402e93f" ON public.interactions USING btree (user_id);


--
-- Name: IDX_5ca38f816304b40dd0637ef2b1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_5ca38f816304b40dd0637ef2b1" ON public.artist USING btree (first_name, last_name, username);


--
-- Name: IDX_6a9775008add570dc3e5a0bab7; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_6a9775008add570dc3e5a0bab7" ON public.tag USING btree (name);


--
-- Name: IDX_6b9d2aa8a96d134a30f49067a8; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_6b9d2aa8a96d134a30f49067a8" ON public.works USING btree (is_featured);


--
-- Name: IDX_6dcd961b8630370e0ad0a29eed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_6dcd961b8630370e0ad0a29eed" ON public.stencils USING btree (artist_id);


--
-- Name: IDX_7ab4a0a0efdc71ec90e1de418b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_7ab4a0a0efdc71ec90e1de418b" ON public.works USING btree (is_hidden);


--
-- Name: IDX_7b153fe07bda01ebdb5bfdc2a7; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_7b153fe07bda01ebdb5bfdc2a7" ON public.works USING btree (source);


--
-- Name: IDX_86485c4347a0a211be01b6bbe2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_86485c4347a0a211be01b6bbe2" ON public.stencil_tags USING btree (stencil_id);


--
-- Name: IDX_887b965a6e195cb4ad42f5ec1f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_887b965a6e195cb4ad42f5ec1f" ON public.artist_tags USING btree (artist_id);


--
-- Name: IDX_8c79246222d0cce60dbb5c44c3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_8c79246222d0cce60dbb5c44c3" ON public.artist_tags USING btree (tag_id);


--
-- Name: IDX_9d6f665830d7610c3232592030; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_9d6f665830d7610c3232592030" ON public.artist_services USING btree (service_id);


--
-- Name: IDX_ad916e8f555df362cbde837513; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ad916e8f555df362cbde837513" ON public.artist USING btree (username);


--
-- Name: IDX_ade287b284aee4855c7f0d16db; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ade287b284aee4855c7f0d16db" ON public.stencils USING btree (deleted_at);


--
-- Name: IDX_ba830dda30ca54c5433c29f0d8; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ba830dda30ca54c5433c29f0d8" ON public.artist_services USING btree (artist_id);


--
-- Name: IDX_ca9018be3cc3d0803b924c17b0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ca9018be3cc3d0803b924c17b0" ON public.interactions USING btree (entity_type, entity_id);


--
-- Name: IDX_ce36fbc731b2b73c1304f2ec7b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ce36fbc731b2b73c1304f2ec7b" ON public.works USING btree (image_id);


--
-- Name: IDX_d94b1d75c4afcee63f0e519dbb; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_d94b1d75c4afcee63f0e519dbb" ON public.interactions USING btree (interaction_type);


--
-- Name: IDX_d9652285b640595c4e10185b2a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_d9652285b640595c4e10185b2a" ON public.work_tags USING btree (work_id);


--
-- Name: IDX_e4bf8e5897fcaf11d24a9d98df; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_e4bf8e5897fcaf11d24a9d98df" ON public.stencils USING btree (status);


--
-- Name: IDX_e901d3dbb3303edc7b5ea16073; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_e901d3dbb3303edc7b5ea16073" ON public.stencils USING btree (is_hidden);


--
-- Name: IDX_ffe01bc889cb1121850aca9a0f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ffe01bc889cb1121850aca9a0f" ON public.works USING btree (artist_id);


--
-- Name: stencil_tags FK_0865d329b903f353b0aeb61e1ef; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stencil_tags
    ADD CONSTRAINT "FK_0865d329b903f353b0aeb61e1ef" FOREIGN KEY (tag_id) REFERENCES public.tag(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: work_tags FK_55598cd484850a747685c787234; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_tags
    ADD CONSTRAINT "FK_55598cd484850a747685c787234" FOREIGN KEY (tag_id) REFERENCES public.tag(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stencils FK_6dcd961b8630370e0ad0a29eed7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stencils
    ADD CONSTRAINT "FK_6dcd961b8630370e0ad0a29eed7" FOREIGN KEY (artist_id) REFERENCES public.artist(id);


--
-- Name: stencil_tags FK_86485c4347a0a211be01b6bbe23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stencil_tags
    ADD CONSTRAINT "FK_86485c4347a0a211be01b6bbe23" FOREIGN KEY (stencil_id) REFERENCES public.stencils(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: artist_tags FK_887b965a6e195cb4ad42f5ec1f9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_tags
    ADD CONSTRAINT "FK_887b965a6e195cb4ad42f5ec1f9" FOREIGN KEY (artist_id) REFERENCES public.artist(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: artist_tags FK_8c79246222d0cce60dbb5c44c35; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_tags
    ADD CONSTRAINT "FK_8c79246222d0cce60dbb5c44c35" FOREIGN KEY (tag_id) REFERENCES public.tag(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: artist_styles FK_8ce1ebc6ad11d6326df27477298; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_styles
    ADD CONSTRAINT "FK_8ce1ebc6ad11d6326df27477298" FOREIGN KEY (artist_id) REFERENCES public.artist(id);


--
-- Name: artist_services FK_9d6f665830d7610c32325920304; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_services
    ADD CONSTRAINT "FK_9d6f665830d7610c32325920304" FOREIGN KEY (service_id) REFERENCES public.service(id);


--
-- Name: artist_services FK_ba830dda30ca54c5433c29f0d8f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_services
    ADD CONSTRAINT "FK_ba830dda30ca54c5433c29f0d8f" FOREIGN KEY (artist_id) REFERENCES public.artist(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: work_tags FK_d9652285b640595c4e10185b2ab; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_tags
    ADD CONSTRAINT "FK_d9652285b640595c4e10185b2ab" FOREIGN KEY (work_id) REFERENCES public.works(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: works FK_ffe01bc889cb1121850aca9a0fd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.works
    ADD CONSTRAINT "FK_ffe01bc889cb1121850aca9a0fd" FOREIGN KEY (artist_id) REFERENCES public.artist(id);


--
-- Name: artist fk_artist_contact; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist
    ADD CONSTRAINT fk_artist_contact FOREIGN KEY (contact_id) REFERENCES public.contact(id);


--
-- PostgreSQL database dump complete
--

