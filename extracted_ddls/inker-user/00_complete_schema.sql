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
-- Name: permission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permission (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    controller character varying NOT NULL,
    action character varying NOT NULL,
    description character varying
);


--
-- Name: role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL
);


--
-- Name: role_permission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permission (
    "roleId" uuid NOT NULL,
    "permissionId" uuid NOT NULL
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    "notificationsEnabled" boolean DEFAULT true NOT NULL,
    "locationServicesEnabled" boolean DEFAULT true NOT NULL,
    preferences jsonb,
    user_id uuid NOT NULL
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    username character varying(100) NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    user_type character varying NOT NULL,
    active boolean DEFAULT false NOT NULL,
    deleted_at timestamp without time zone,
    phone_number character varying,
    "roleId" uuid
);


--
-- Name: verification_hash; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_hash (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id character varying NOT NULL,
    hash character varying NOT NULL,
    tries integer NOT NULL,
    email character varying,
    phone character varying,
    notification_type character varying NOT NULL,
    verification_type character varying NOT NULL
);


--
-- Name: settings PK_0669fe20e252eb692bf4d344975; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY (id);


--
-- Name: verification_hash PK_2c717c842fd23dc4f75ab5e2fbd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_hash
    ADD CONSTRAINT "PK_2c717c842fd23dc4f75ab5e2fbd" PRIMARY KEY (id);


--
-- Name: permission PK_3b8b97af9d9d8807e41e6f48362; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY (id);


--
-- Name: role PK_b36bcfe02fc8de3c57a8b2391c2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY (id);


--
-- Name: role_permission PK_b42bbacb8402c353df822432544; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT "PK_b42bbacb8402c353df822432544" PRIMARY KEY ("roleId", "permissionId");


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: settings REL_a2883eaa72b3b2e8c98e744609; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT "REL_a2883eaa72b3b2e8c98e744609" UNIQUE (user_id);


--
-- Name: permission UQ_9573e71191df070245e24255230; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT "UQ_9573e71191df070245e24255230" UNIQUE (controller);


--
-- Name: IDX_60e71e288bab95a5ac05f58a84; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_60e71e288bab95a5ac05f58a84" ON public."user" USING btree (user_type);


--
-- Name: IDX_6142d018460a0f1d602dcac6cb; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_6142d018460a0f1d602dcac6cb" ON public.verification_hash USING btree (user_id);


--
-- Name: IDX_72e80be86cab0e93e67ed1a7a9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_72e80be86cab0e93e67ed1a7a9" ON public.role_permission USING btree ("permissionId");


--
-- Name: IDX_a2fbc58df09b3f7d313b44efee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_a2fbc58df09b3f7d313b44efee" ON public.verification_hash USING btree (phone);


--
-- Name: IDX_ae4578dcaed5adff96595e6166; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ae4578dcaed5adff96595e6166" ON public.role USING btree (name);


--
-- Name: IDX_e3130a39c1e4a740d044e68573; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_e3130a39c1e4a740d044e68573" ON public.role_permission USING btree ("roleId");


--
-- Name: IDX_e85ede11c4408672807ea531c5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_e85ede11c4408672807ea531c5" ON public.verification_hash USING btree (email);


--
-- Name: role_permission FK_72e80be86cab0e93e67ed1a7a9a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT "FK_72e80be86cab0e93e67ed1a7a9a" FOREIGN KEY ("permissionId") REFERENCES public.permission(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: settings FK_a2883eaa72b3b2e8c98e7446098; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT "FK_a2883eaa72b3b2e8c98e7446098" FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: user FK_c28e52f758e7bbc53828db92194; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES public.role(id);


--
-- Name: role_permission FK_e3130a39c1e4a740d044e685730; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT "FK_e3130a39c1e4a740d044e685730" FOREIGN KEY ("roleId") REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

