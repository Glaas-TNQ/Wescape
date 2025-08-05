-- 04_create_connections_table.sql
-- Creates 'connections' table for linking cards with optional metadata
-- Aligns with frontend realtime filters by including trip_id
-- Enforces that both endpoint cards belong to the same trip

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  from_card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  to_card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'default',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for efficient filtering and graph operations
CREATE INDEX IF NOT EXISTS idx_connections_trip_id ON public.connections(trip_id);
CREATE INDEX IF NOT EXISTS idx_connections_from_card_id ON public.connections(from_card_id);
CREATE INDEX IF NOT EXISTS idx_connections_to_card_id ON public.connections(to_card_id);
CREATE INDEX IF NOT EXISTS idx_connections_created_at ON public.connections(created_at);

-- Ensure no self-loop unless explicitly allowed (here we disallow)
ALTER TABLE public.connections
  ADD CONSTRAINT chk_connections_not_self_loop
  CHECK (from_card_id <> to_card_id);

-- Ensure endpoints belong to same trip_id by checking against cards table
-- Implemented via trigger to avoid heavy CHECKs with subqueries
CREATE OR REPLACE FUNCTION public.connections_validate_trip_consistency()
RETURNS TRIGGER AS $$
DECLARE
  from_trip UUID;
  to_trip UUID;
BEGIN
  -- Validate that referenced cards exist and belong to the same trip
  SELECT trip_id INTO from_trip FROM public.cards WHERE id = NEW.from_card_id;
  SELECT trip_id INTO to_trip FROM public.cards WHERE id = NEW.to_card_id;

  IF from_trip IS NULL OR to_trip IS NULL THEN
    RAISE EXCEPTION 'Referenced card not found for connection';
  END IF;

  IF from_trip <> to_trip THEN
    RAISE EXCEPTION 'from_card and to_card must belong to the same trip';
  END IF;

  -- Ensure NEW.trip_id matches cards trip_id
  IF NEW.trip_id IS NULL THEN
    NEW.trip_id := from_trip;
  ELSIF NEW.trip_id <> from_trip THEN
    RAISE EXCEPTION 'connection.trip_id must match cards trip_id';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_connections_validate_trip ON public.connections;
CREATE TRIGGER trg_connections_validate_trip
BEFORE INSERT OR UPDATE ON public.connections
FOR EACH ROW
EXECUTE FUNCTION public.connections_validate_trip_consistency();