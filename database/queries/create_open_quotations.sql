-- Create QuotationType enum
CREATE TYPE "quotation_type" AS ENUM('DIRECT', 'OPEN');

-- Create QuotationOfferStatus enum
CREATE TYPE "quotation_offer_status" AS ENUM('SUBMITTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- Alter quotations table
ALTER TABLE "quotations"
ADD COLUMN "type" "quotation_type" NOT NULL DEFAULT 'DIRECT';

ALTER TABLE "quotations"
ADD COLUMN "customer_lat" double precision,
ADD COLUMN "customer_lon" double precision,
ADD COLUMN "customer_travel_radius_km" integer;

ALTER TABLE "quotations"
ALTER COLUMN "artist_id" DROP NOT NULL;

-- Add new value to existing quotation_status enum
-- Note: Adding enum values requires specific handling in PostgreSQL, often involving temporary types or specific ALTER TYPE commands.
-- This command might need adjustment based on your PostgreSQL version and setup.
-- Option 1 (Simpler, might require downtime or specific permissions):
ALTER TYPE "quotation_status" ADD VALUE 'open';
-- Option 2 (More complex, avoids locking issues, requires intermediate steps usually handled by migration tools)
-- Omitted for manual script brevity, assuming Option 1 is acceptable or will be adapted.

-- Create quotation_offers table
CREATE TABLE "quotation_offers" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "quotation_id" uuid NOT NULL,
    "artist_id" uuid NOT NULL,
    "estimated_cost" jsonb,
    "estimated_duration" integer,
    "message" text,
    "status" "quotation_offer_status" NOT NULL DEFAULT 'SUBMITTED',
    CONSTRAINT "PK_quotation_offers_id" PRIMARY KEY ("id")
);

-- Create indexes for quotation_offers
CREATE INDEX "IDX_quotation_offers_quotation_id" ON "quotation_offers" ("quotation_id");
CREATE INDEX "IDX_quotation_offers_artist_id" ON "quotation_offers" ("artist_id");

-- Add foreign key constraints for quotation_offers
ALTER TABLE "quotation_offers"
ADD CONSTRAINT "FK_quotation_offers_quotation_id" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quotation_offers"
ADD CONSTRAINT "FK_quotation_offers_artist_id" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; 