-- Migration: Add indexes for scheduler performance optimization
-- This migration adds missing indexes to improve query performance for the scheduler view
-- Version: 2.0 - Enhanced with more specific indexes for scheduler queries

-- Drop existing indexes to replace with better ones
DROP INDEX IF EXISTS idx_agenda_event_status;
DROP INDEX IF EXISTS idx_agenda_event_agenda_dates;
DROP INDEX IF EXISTS idx_quotation_artist_status;

-- 1. Composite index for the main scheduler event query
-- Covers: agenda_id, startDate range, status IN list, and deletedAt IS NULL
CREATE INDEX IF NOT EXISTS idx_scheduler_events_main 
ON agenda_event(agenda_id, start_date, status, deleted_at)
WHERE deleted_at IS NULL;

-- 2. Index for event date range overlap calculations
CREATE INDEX IF NOT EXISTS idx_event_date_overlap 
ON agenda_event(agenda_id, start_date, end_date);

-- 3. Index for quotation scheduler queries (DIRECT type with active statuses)
CREATE INDEX IF NOT EXISTS idx_quotation_scheduler_direct 
ON quotation(artist_id, type, status, appointment_date)
WHERE type = 'DIRECT' AND status IN ('QUOTED', 'APPEALED');

-- 4. Index for quotation OPEN type queries
CREATE INDEX IF NOT EXISTS idx_quotation_scheduler_open 
ON quotation(type, status, appointment_date)
WHERE type = 'OPEN' AND status IN ('OPEN', 'EVALUATING_OFFERS');

-- 5. Covering index for customer batch lookups
CREATE INDEX IF NOT EXISTS idx_customer_lookup 
ON customer(id) INCLUDE (first_name, last_name, profile_thumbnail);

-- 6. Index on QuotationOffer for artist participation check
CREATE INDEX IF NOT EXISTS idx_quotation_offer_artist_participation 
ON quotation_offers(quotation_id, artist_id, status);

-- 7. Index for QuotationOffer date range and artist
CREATE INDEX IF NOT EXISTS idx_quotation_offer_scheduler 
ON quotation_offers(artist_id, estimated_date, status)
WHERE status = 'PENDING';

-- 8. Index for agenda settings lookup
CREATE INDEX IF NOT EXISTS idx_agenda_artist 
ON agenda(artist_id);

-- 9. Index for unavailable times query
CREATE INDEX IF NOT EXISTS idx_agenda_unavailable_time_lookup 
ON agenda_unavailable_time(agenda_id, date, deleted_at)
WHERE deleted_at IS NULL;

-- 10. Partial index for active events (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_active_events_partial 
ON agenda_event(agenda_id, start_date)
WHERE status IN ('CREATED', 'PENDING_CONFIRMATION', 'CONFIRMED', 'IN_PROGRESS', 
                 'PAYMENT_PENDING', 'RESCHEDULED', 'COMPLETED', 
                 'WAITING_FOR_PHOTOS', 'WAITING_FOR_REVIEW')
  AND deleted_at IS NULL;

-- 11. Index for density calculation queries
CREATE INDEX IF NOT EXISTS idx_event_density_calc 
ON agenda_event(agenda_id, start_date, end_date, status)
WHERE deleted_at IS NULL 
  AND status IN ('CONFIRMED', 'IN_PROGRESS', 'PAYMENT_PENDING');

-- 12. Index for quotation offers join with quotation
CREATE INDEX IF NOT EXISTS idx_quotation_offer_join 
ON quotation_offers(quotation_id) INCLUDE (artist_id, estimated_date, estimated_duration, status);

-- Update table statistics for query planner
ANALYZE agenda_event;
ANALYZE quotation;
ANALYZE quotation_offers;
ANALYZE customer;
ANALYZE agenda;
ANALYZE agenda_unavailable_time;

-- Add table comments for documentation
COMMENT ON INDEX idx_scheduler_events_main IS 'Main index for scheduler event queries with agenda, date range, and status filters';
COMMENT ON INDEX idx_quotation_scheduler_direct IS 'Optimized for fetching direct quotations that need artist response';
COMMENT ON INDEX idx_quotation_scheduler_open IS 'Optimized for fetching open quotations in scheduler view';
COMMENT ON INDEX idx_event_density_calc IS 'Specialized index for density calculation queries';