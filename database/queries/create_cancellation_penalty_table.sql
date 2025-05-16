-- database/queries/create_cancellation_penalty_table.sql

-- Drop table if it exists to allow for recreation during development
DROP TABLE IF EXISTS "cancellation_penalty";

-- Create PenaltyType enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'penalty_type_enum') THEN
        CREATE TYPE penalty_type_enum AS ENUM (
            'fixed_fee',
            'percentage',
            'reputation_points'
        );
    END IF;
END$$;

-- Create PenaltyStatus enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'penalty_status_enum') THEN
        CREATE TYPE penalty_status_enum AS ENUM (
            'pending',
            'applied',
            'waived'
        );
    END IF;
END$$;

-- Create the cancellation_penalty table
CREATE TABLE "cancellation_penalty" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP WITH TIME ZONE,
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" penalty_type_enum NOT NULL,
    "amount" DECIMAL(10, 2),
    "reputation_points" INTEGER,
    "metadata" JSONB,
    "status" penalty_status_enum NOT NULL DEFAULT 'pending',
    "agenda_id" UUID,
    "quotation_id" UUID
);

-- Add indexes
CREATE INDEX "idx_penalty_event_id" ON "cancellation_penalty" ("event_id");
CREATE INDEX "idx_penalty_user_id" ON "cancellation_penalty" ("user_id");
CREATE INDEX "idx_penalty_agenda_id" ON "cancellation_penalty" ("agenda_id");
CREATE INDEX "idx_penalty_quotation_id" ON "cancellation_penalty" ("quotation_id");
CREATE INDEX "idx_penalty_status" ON "cancellation_penalty" ("status");
CREATE INDEX "idx_penalty_type" ON "cancellation_penalty" ("type");

-- Optional: Add foreign key constraints if related tables (events, users, agendas, quotations) exist
-- ALTER TABLE "cancellation_penalty" ADD CONSTRAINT "fk_penalty_event" FOREIGN KEY ("event_id") REFERENCES "agenda_event" ("id") ON DELETE SET NULL;
-- ALTER TABLE "cancellation_penalty" ADD CONSTRAINT "fk_penalty_user" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE; -- Assuming a 'user' table
-- ALTER TABLE "cancellation_penalty" ADD CONSTRAINT "fk_penalty_agenda" FOREIGN KEY ("agenda_id") REFERENCES "agenda" ("id") ON DELETE SET NULL;
-- ALTER TABLE "cancellation_penalty" ADD CONSTRAINT "fk_penalty_quotation" FOREIGN KEY ("quotation_id") REFERENCES "quotation" ("id") ON DELETE SET NULL;

COMMENT ON TABLE "cancellation_penalty" IS 'Stores records of penalties applied due to event cancellations.';
COMMENT ON COLUMN "cancellation_penalty"."event_id" IS 'The ID of the event that was cancelled.';
COMMENT ON COLUMN "cancellation_penalty"."user_id" IS 'The ID of the user (artist or customer) who incurred the penalty.';
COMMENT ON COLUMN "cancellation_penalty"."type" IS 'The type of penalty (e.g., fixed_fee, percentage, reputation_points).';
COMMENT ON COLUMN "cancellation_penalty"."amount" IS 'The monetary amount of the penalty, if applicable.';
COMMENT ON COLUMN "cancellation_penalty"."reputation_points" IS 'The number of reputation points deducted or awarded, if applicable.';
COMMENT ON COLUMN "cancellation_penalty"."metadata" IS 'JSONB field to store additional context about the penalty (cancellation time, user role, etc.).';
COMMENT ON COLUMN "cancellation_penalty"."status" IS 'The current status of the penalty (e.g., pending, applied, waived).';
COMMENT ON COLUMN "cancellation_penalty"."agenda_id" IS 'The ID of the agenda associated with the event, for easier grouping.';
COMMENT ON COLUMN "cancellation_penalty"."quotation_id" IS 'The ID of the quotation associated with the event, for context.'; 