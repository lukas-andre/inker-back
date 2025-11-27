-- Create extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First drop the foreign key constraint on artist_metrics_viewers
ALTER TABLE artist_metrics_viewers 
  DROP CONSTRAINT IF EXISTS "FK_b7b49edbf1b02ccbee4d82868df";

-- Fix artist_metrics table
ALTER TABLE artist_metrics ADD COLUMN artist_id_uuid UUID;
UPDATE artist_metrics SET artist_id_uuid = uuid_generate_v4();
ALTER TABLE artist_metrics 
  DROP CONSTRAINT IF EXISTS "PK_078efd97d1462740448f8b7ef22" CASCADE,
  DROP CONSTRAINT IF EXISTS "IDX_f96f80047970cd4d6cb8e9ddb0" CASCADE,
  ALTER COLUMN artist_id TYPE UUID USING artist_id_uuid,
  DROP COLUMN artist_id_uuid,
  ADD CONSTRAINT "PK_078efd97d1462740448f8b7ef22" PRIMARY KEY (id);
CREATE UNIQUE INDEX "IDX_f96f80047970cd4d6cb8e9ddb0" ON artist_metrics(artist_id);

-- Fix content_metrics table
-- First drop the foreign key constraint on content_metrics_viewers
ALTER TABLE content_metrics_viewers 
  DROP CONSTRAINT IF EXISTS "FK_0e40fda1c79da2bb9edd3e818b5";

ALTER TABLE content_metrics ADD COLUMN content_id_uuid UUID;
UPDATE content_metrics SET content_id_uuid = uuid_generate_v4();
ALTER TABLE content_metrics 
  DROP CONSTRAINT IF EXISTS "PK_ae4a61c74a5142e2ec754147141" CASCADE,
  DROP CONSTRAINT IF EXISTS "IDX_45549bf4dbca82611ce8c94804" CASCADE,
  ALTER COLUMN content_id TYPE UUID USING content_id_uuid,
  DROP COLUMN content_id_uuid,
  ADD CONSTRAINT "PK_ae4a61c74a5142e2ec754147141" PRIMARY KEY (id);
CREATE UNIQUE INDEX "IDX_45549bf4dbca82611ce8c94804" ON content_metrics(content_id, content_type);

-- Fix artist_metrics_viewers table
-- Make sure ID column is UUID, not serial
ALTER TABLE artist_metrics_viewers 
  DROP CONSTRAINT IF EXISTS "PK_66335507e24927bf9ef744cb6b4" CASCADE,
  ADD COLUMN temp_id UUID DEFAULT uuid_generate_v4(),
  DROP COLUMN id,
  ALTER COLUMN temp_id SET NOT NULL,  
  ADD CONSTRAINT "PK_66335507e24927bf9ef744cb6b4" PRIMARY KEY (temp_id),
  RENAME COLUMN temp_id TO id;

-- Fix content_metrics_viewers table  
-- Make sure ID column is UUID, not serial
ALTER TABLE content_metrics_viewers 
  DROP CONSTRAINT IF EXISTS "PK_0fc8d51af82bd3a8c78d3af155e" CASCADE,
  ADD COLUMN temp_id UUID DEFAULT uuid_generate_v4(),
  DROP COLUMN id,
  ALTER COLUMN temp_id SET NOT NULL,
  ADD CONSTRAINT "PK_0fc8d51af82bd3a8c78d3af155e" PRIMARY KEY (temp_id),
  RENAME COLUMN temp_id TO id;

-- Recreate foreign key constraints
ALTER TABLE artist_metrics_viewers
  ADD CONSTRAINT "FK_b7b49edbf1b02ccbee4d82868df" FOREIGN KEY (metrics_id) 
  REFERENCES artist_metrics(id) ON DELETE CASCADE;

ALTER TABLE content_metrics_viewers
  ADD CONSTRAINT "FK_0e40fda1c79da2bb9edd3e818b5" FOREIGN KEY (metrics_id) 
  REFERENCES content_metrics(id) ON DELETE CASCADE; 