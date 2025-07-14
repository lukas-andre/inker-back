-- Migration: Add desired_body_location to quotation table
-- Date: 2024-01-14
-- Description: Adds a field to store the desired body location for tattoo quotations

-- Add the column
ALTER TABLE quotation 
ADD COLUMN desired_body_location VARCHAR(100) NULL;

-- Add comment for documentation
COMMENT ON COLUMN quotation.desired_body_location IS 'Optional field indicating where on the body the customer wants the tattoo';

-- Optional: Add index if we plan to filter/search by body location
-- CREATE INDEX idx_quotation_desired_body_location ON quotation(desired_body_location);