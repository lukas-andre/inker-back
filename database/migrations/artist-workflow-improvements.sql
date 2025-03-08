-- Artist Workflow Improvements Migration

-- Update agenda table for working hours
ALTER TABLE agenda 
  ADD COLUMN IF NOT EXISTS working_hours_start TIME,
  ADD COLUMN IF NOT EXISTS working_hours_end TIME;

-- Create agenda_unavailable_time table
CREATE TABLE IF NOT EXISTS agenda_unavailable_time (
  id SERIAL PRIMARY KEY,
  agenda_id INTEGER NOT NULL REFERENCES agenda(id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Create indexes for agenda_unavailable_time
CREATE INDEX IF NOT EXISTS idx_unavailable_time_agenda_id ON agenda_unavailable_time(agenda_id);
CREATE INDEX IF NOT EXISTS idx_unavailable_time_dates ON agenda_unavailable_time(start_date, end_date);

-- Update agenda_event table with new fields
ALTER TABLE agenda_event 
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS preparation_time INTEGER,
  ADD COLUMN IF NOT EXISTS cleanup_time INTEGER,
  ADD COLUMN IF NOT EXISTS reschedule_reason VARCHAR(255),
  ADD COLUMN IF NOT EXISTS last_status_change TIMESTAMP,
  ADD COLUMN IF NOT EXISTS customer_notified BOOLEAN DEFAULT FALSE;

-- Create index for performance on agenda_event date range with status
CREATE INDEX IF NOT EXISTS idx_agenda_event_date_range_status 
  ON agenda_event(agenda_id, start_date, end_date, status);

-- Add 'RESCHEDULED' status option to enum if needed 
-- (agendaEventStatus.enum.ts already includes this status)