-- 06_enable_realtime_publication.sql
-- Adds tables to Supabase Realtime publication for live updates in the frontend
-- Ensure this is run after tables are created

-- The default realtime publication in Supabase is named 'supabase_realtime'
-- Add cards and connections so the frontend can subscribe by trip_id

-- Create publication if it does not exist (safe-guard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Add tables to publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;

-- Optionally add trips if you plan to subscribe to trip changes
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;

-- Note:
-- Row Level Security policies will still apply; realtime will only deliver changes
-- visible to the authenticated user, based on RLS.