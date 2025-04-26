-- Enable the pg_trgm extension for PostgreSQL
-- This extension provides functions and operators for determining the similarity of text
-- based on trigram matching, which is essential for our fuzzy text matching functionality

-- Note: This requires superuser privileges or at least CREATE privilege on the database
CREATE EXTENSION IF NOT EXISTS pg_trgm; 