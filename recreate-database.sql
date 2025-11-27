-- Stop connections to allow database drop
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'inker-analytics'
AND pid <> pg_backend_pid();

-- Drop the database
DROP DATABASE IF EXISTS "inker-analytics";

-- Create the database
CREATE DATABASE "inker-analytics";

-- Connect to the new database
\c "inker-analytics"

-- Create the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create artist_metrics table with UUID columns
CREATE TABLE public.artist_metrics (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    artist_id uuid NOT NULL,
    metrics jsonb DEFAULT '{"views": {"count": 0, "uniqueCount": 0}}'::jsonb NOT NULL,
    CONSTRAINT "PK_078efd97d1462740448f8b7ef22" PRIMARY KEY (id)
);
CREATE UNIQUE INDEX "IDX_f96f80047970cd4d6cb8e9ddb0" ON public.artist_metrics USING btree (artist_id);

-- Create artist_metrics_viewers table with UUID columns
CREATE TABLE public.artist_metrics_viewers (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    metrics_id uuid NOT NULL,
    viewer_key varchar(100) NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "PK_66335507e24927bf9ef744cb6b4" PRIMARY KEY (id)
);
CREATE UNIQUE INDEX "IDX_1d457c048def92e36e7368b10f" ON public.artist_metrics_viewers USING btree (metrics_id, viewer_key);

-- Create the content type enum
CREATE TYPE public.content_metrics_content_type_enum AS ENUM ('stencil', 'work', 'artist_profile');

-- Create content_metrics table with UUID columns
CREATE TABLE public.content_metrics (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    content_id uuid NOT NULL,
    content_type public.content_metrics_content_type_enum NOT NULL,
    metrics jsonb DEFAULT '{"views": {"count": 0, "uniqueCount": 0}}'::jsonb NOT NULL,
    CONSTRAINT "PK_ae4a61c74a5142e2ec754147141" PRIMARY KEY (id)
);
CREATE UNIQUE INDEX "IDX_45549bf4dbca82611ce8c94804" ON public.content_metrics USING btree (content_id, content_type);

-- Create content_metrics_viewers table with UUID columns
CREATE TABLE public.content_metrics_viewers (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    metrics_id uuid NOT NULL,
    viewer_key varchar(100) NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "PK_0fc8d51af82bd3a8c78d3af155e" PRIMARY KEY (id)
);
CREATE UNIQUE INDEX "IDX_6acfaaaf9428a46acea202825b" ON public.content_metrics_viewers USING btree (metrics_id, viewer_key);

-- Create query-result-cache table
CREATE TABLE public."query-result-cache" (
    id serial4 NOT NULL,
    identifier varchar NULL,
    "time" int8 NOT NULL,
    duration int4 NOT NULL,
    query text NOT NULL,
    "result" text NOT NULL,
    CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY (id)
);

-- Add foreign key constraints
ALTER TABLE artist_metrics_viewers
  ADD CONSTRAINT "FK_b7b49edbf1b02ccbee4d82868df" FOREIGN KEY (metrics_id) 
  REFERENCES artist_metrics(id) ON DELETE CASCADE;

ALTER TABLE content_metrics_viewers
  ADD CONSTRAINT "FK_0e40fda1c79da2bb9edd3e818b5" FOREIGN KEY (metrics_id) 
  REFERENCES content_metrics(id) ON DELETE CASCADE; 