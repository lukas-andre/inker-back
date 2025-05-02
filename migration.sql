-- Add tattoo design cache fields to quotation table
ALTER TABLE quotation
ADD COLUMN tattoo_design_cache_id UUID NULL,
ADD COLUMN tattoo_design_image_url TEXT NULL;

-- Add an index to the new tattoo_design_cache_id column
CREATE INDEX IF NOT EXISTS idx_quotation_tattoo_design_cache_id ON quotation (tattoo_design_cache_id);

-- Add constraints (optional, depending on desired strictness)
-- Ensure that stencil_id and tattoo_design_cache_id are mutually exclusive
ALTER TABLE quotation
ADD CONSTRAINT chk_quotation_source_exclusive CHECK (
  (stencil_id IS NULL AND tattoo_design_cache_id IS NOT NULL AND tattoo_design_image_url IS NOT NULL AND type = 'OPEN') OR
  (stencil_id IS NOT NULL AND tattoo_design_cache_id IS NULL AND tattoo_design_image_url IS NULL) OR
  (stencil_id IS NULL AND tattoo_design_cache_id IS NULL AND tattoo_design_image_url IS NULL)
);

-- Ensure tattoo fields are only used for OPEN type
ALTER TABLE quotation
ADD CONSTRAINT chk_quotation_tattoo_cache_for_open CHECK (
  (tattoo_design_cache_id IS NULL AND tattoo_design_image_url IS NULL) OR type = 'OPEN'
);

-- Add tattoo design cache fields to quotation_history table
ALTER TABLE quotation_history
ADD COLUMN previous_tattoo_design_cache_id UUID NULL,
ADD COLUMN new_tattoo_design_cache_id UUID NULL,
ADD COLUMN previous_tattoo_design_image_url TEXT NULL,
ADD COLUMN new_tattoo_design_image_url TEXT NULL;

-- Optional: Add comments to new columns
COMMENT ON COLUMN quotation.tattoo_design_cache_id IS 'Reference to the AI-generated tattoo design cache entity.';
COMMENT ON COLUMN quotation.tattoo_design_image_url IS 'Specific image URL selected from the referenced tattoo design cache.';
COMMENT ON COLUMN quotation_history.previous_tattoo_design_cache_id IS 'Previous value of tattoo_design_cache_id before the change.';
COMMENT ON COLUMN quotation_history.new_tattoo_design_cache_id IS 'New value of tattoo_design_cache_id after the change.';
COMMENT ON COLUMN quotation_history.previous_tattoo_design_image_url IS 'Previous value of tattoo_design_image_url before the change.';
COMMENT ON COLUMN quotation_history.new_tattoo_design_image_url IS 'New value of tattoo_design_image_url after the change.'; 