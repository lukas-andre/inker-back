-- Enable the pg_trgm extension for similarity search and fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create the tattoo_translation_cache table
CREATE TABLE IF NOT EXISTS tattoo_translation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text VARCHAR(255) NOT NULL,
  translated_text TEXT NOT NULL,
  source_language VARCHAR(10) NOT NULL,
  target_language VARCHAR(10) NOT NULL,
  image_urls TEXT,
  metadata TEXT,
  search_vector TSVECTOR,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  usage_count INTEGER NOT NULL DEFAULT 1
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_tattoo_cache_source_text ON tattoo_translation_cache(source_text);
CREATE INDEX IF NOT EXISTS idx_tattoo_cache_language_pair ON tattoo_translation_cache(source_language, target_language);
CREATE INDEX IF NOT EXISTS idx_tattoo_cache_created_at ON tattoo_translation_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_tattoo_cache_usage_count ON tattoo_translation_cache(usage_count DESC);

-- Create a GIN index for the full-text search vector
CREATE INDEX IF NOT EXISTS idx_tattoo_cache_search_vector ON tattoo_translation_cache USING GIN(search_vector);

-- Create a GIN index for trigram similarity on source_text
CREATE INDEX IF NOT EXISTS idx_tattoo_cache_source_text_trgm ON tattoo_translation_cache USING GIN(source_text gin_trgm_ops);

-- Create a trigger to automatically update the search_vector column
CREATE OR REPLACE FUNCTION tattoo_cache_update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.source_text, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.translated_text, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.metadata, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger before each insert or update
CREATE TRIGGER tattoo_cache_vector_update
BEFORE INSERT OR UPDATE ON tattoo_translation_cache
FOR EACH ROW EXECUTE FUNCTION tattoo_cache_update_search_vector();

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION tattoo_cache_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the timestamp trigger before each update
CREATE TRIGGER tattoo_cache_timestamp_update
BEFORE UPDATE ON tattoo_translation_cache
FOR EACH ROW EXECUTE FUNCTION tattoo_cache_update_timestamp(); 