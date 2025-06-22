-- Migration: Add indexes for scheduler performance optimization
-- This migration adds missing indexes to improve query performance for the scheduler view

-- 1. Index on AgendaEvent for status queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_agenda_event_status ON agenda_event(status);

-- 2. Composite index for agenda + date range queries
CREATE INDEX IF NOT EXISTS idx_agenda_event_agenda_dates ON agenda_event(agenda_id, start_date, end_date);

-- 3. Index on AgendaEvent for deleted_at (soft deletes)
CREATE INDEX IF NOT EXISTS idx_agenda_event_deleted_at ON agenda_event(deleted_at);

-- 4. Index on Quotation for type and status combination
CREATE INDEX IF NOT EXISTS idx_quotation_type_status ON quotation(type, status);

-- 5. Index on Quotation for artist_id + status (for DIRECT quotations)
CREATE INDEX IF NOT EXISTS idx_quotation_artist_status ON quotation(artist_id, status);

-- 6. Index on Quotation for appointment_date (for date filtering)
CREATE INDEX IF NOT EXISTS idx_quotation_appointment_date ON quotation(appointment_date);

-- 7. Index on QuotationOffer for quotation_id + artist_id (to check if artist has offer)
CREATE INDEX IF NOT EXISTS idx_quotation_offer_quotation_artist ON quotation_offers(quotation_id, artist_id);

-- 8. Index on QuotationOffer for estimated_date (for date range queries)
CREATE INDEX IF NOT EXISTS idx_quotation_offer_estimated_date ON quotation_offers(estimated_date);

-- 9. Composite index for QuotationOffer date range queries with artist
CREATE INDEX IF NOT EXISTS idx_quotation_offer_artist_date ON quotation_offers(artist_id, estimated_date);

-- 10. Index on Customer for batch lookups
CREATE INDEX IF NOT EXISTS idx_customer_id ON customer(id);

-- ANALYZE tables to update statistics after adding indexes
ANALYZE agenda_event;
ANALYZE quotation;
ANALYZE quotation_offers;
ANALYZE customer;