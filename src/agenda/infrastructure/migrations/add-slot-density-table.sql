-- Migration: Create agenda_slot_density table for pre-calculated density scores
-- This table stores pre-calculated density scores for time slots to improve scheduler performance

-- Create the agenda_slot_density table
CREATE TABLE IF NOT EXISTS agenda_slot_density (
  agenda_id UUID NOT NULL,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  density_score DECIMAL(5,2) DEFAULT 0,
  nearby_events_count INT DEFAULT 0,
  conflicting_events_count INT DEFAULT 0,
  is_unavailable BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (agenda_id, slot_date, slot_time),
  CONSTRAINT fk_agenda_slot_density_agenda 
    FOREIGN KEY (agenda_id) 
    REFERENCES agenda(id) 
    ON DELETE CASCADE
);

-- Create indexes for efficient lookups
CREATE INDEX idx_slot_density_lookup 
  ON agenda_slot_density(agenda_id, slot_date, slot_time);

CREATE INDEX idx_slot_density_date 
  ON agenda_slot_density(slot_date);

-- Create partial index for available slots only
CREATE INDEX idx_slot_density_available 
  ON agenda_slot_density(agenda_id, slot_date, density_score)
  WHERE is_unavailable = FALSE;

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_slot_density_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the timestamp
CREATE TRIGGER update_agenda_slot_density_timestamp
  BEFORE UPDATE ON agenda_slot_density
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_density_timestamp();

-- Create a materialized view for weekly density summaries (optional optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS weekly_density_summary AS
SELECT 
  agenda_id,
  DATE_TRUNC('week', slot_date) as week_start,
  EXTRACT(HOUR FROM slot_time) as hour_of_day,
  AVG(density_score) as avg_density,
  COUNT(*) as slot_count,
  SUM(CASE WHEN density_score > 75 THEN 1 ELSE 0 END) as high_density_slots
FROM agenda_slot_density
WHERE is_unavailable = FALSE
GROUP BY agenda_id, week_start, hour_of_day;

-- Create index on the materialized view
CREATE INDEX idx_weekly_density_summary_lookup 
  ON weekly_density_summary(agenda_id, week_start);

-- Add comments for documentation
COMMENT ON TABLE agenda_slot_density IS 'Pre-calculated density scores for appointment time slots';
COMMENT ON COLUMN agenda_slot_density.density_score IS 'Density score 0-100, higher means busier/less desirable';
COMMENT ON COLUMN agenda_slot_density.nearby_events_count IS 'Number of events within 2 hours of this slot';
COMMENT ON COLUMN agenda_slot_density.conflicting_events_count IS 'Number of events that overlap with this slot';
COMMENT ON COLUMN agenda_slot_density.metadata IS 'JSON metadata including calculation factors and last update time';