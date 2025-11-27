-- Enable the pg_trgm extension for similarity search and fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create the tattoo_design_cache table
CREATE TABLE IF NOT EXISTS tattoo_design_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_query TEXT NOT NULL,
  style TEXT,
  image_urls TEXT[] NOT NULL,
  prompt TEXT,
  metadata JSONB,
  search_vector TSVECTOR,
  usage_count INTEGER NOT NULL DEFAULT 1,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_tattoo_design_user_query ON tattoo_design_cache USING gin(user_query gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tattoo_design_style ON tattoo_design_cache(style);
CREATE INDEX IF NOT EXISTS idx_tattoo_design_created_at ON tattoo_design_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_tattoo_design_usage_count ON tattoo_design_cache(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_tattoo_design_favorite ON tattoo_design_cache(is_favorite) WHERE is_favorite = TRUE;

-- Create a GIN index for the full-text search vector
CREATE INDEX IF NOT EXISTS idx_tattoo_design_search_vector ON tattoo_design_cache USING GIN(search_vector);

-- Create a trigger to automatically update the search_vector column
CREATE OR REPLACE FUNCTION tattoo_design_update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.user_query, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.style, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.prompt, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger before each insert or update
CREATE TRIGGER tattoo_design_vector_update
BEFORE INSERT OR UPDATE ON tattoo_design_cache
FOR EACH ROW EXECUTE FUNCTION tattoo_design_update_search_vector();

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION tattoo_design_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the timestamp trigger before each update
CREATE TRIGGER tattoo_design_timestamp_update
BEFORE UPDATE ON tattoo_design_cache
FOR EACH ROW EXECUTE FUNCTION tattoo_design_update_timestamp(); 