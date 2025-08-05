-- 03_create_card_versions_table.sql
-- Creates 'card_versions' table for immutable version history of cards

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.card_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version_number INTEGER NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  prompt TEXT
);

-- Ensure version_number increments per card and is unique per card
CREATE UNIQUE INDEX IF NOT EXISTS uq_card_versions_card_id_version
  ON public.card_versions(card_id, version_number);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_card_versions_card_id ON public.card_versions(card_id);
CREATE INDEX IF NOT EXISTS idx_card_versions_created_at ON public.card_versions(created_at);

-- Optional helper function to auto-increment version_number if not provided
-- Keeps client simple; can still supply explicit version_number if desired
CREATE OR REPLACE FUNCTION public.card_versions_assign_next_version()
RETURNS TRIGGER AS $$
DECLARE
  next_ver integer;
BEGIN
  IF NEW.version_number IS NULL THEN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_ver
    FROM public.card_versions
    WHERE card_id = NEW.card_id;
    NEW.version_number = next_ver;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_card_versions_assign_next_version ON public.card_versions;
CREATE TRIGGER trg_card_versions_assign_next_version
BEFORE INSERT ON public.card_versions
FOR EACH ROW
EXECUTE FUNCTION public.card_versions_assign_next_version();