-- 05_enable_rls_and_policies.sql
-- Enables Row Level Security and defines policies for trips, cards, card_versions, and connections
-- Assumes Supabase Auth schema and functions are available

-- Enable RLS on all tables
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Helper notes:
-- - auth.uid() returns the UUID of the authenticated user.
-- - trips.user_id is the owner of a trip.
-- - cards.trip_id references trips(id).
-- - card_versions.card_id references cards(id); created_by may be null for system actions.
-- - connections.trip_id references trips(id); both endpoints must belong to same trip as enforced by trigger.


-- =========================================
-- Policies for public.trips
-- =========================================

-- Select: only owner can read own trips
DROP POLICY IF EXISTS trips_select_own ON public.trips;
CREATE POLICY trips_select_own ON public.trips
FOR SELECT
USING (auth.uid() = user_id);

-- Insert: only allow creating trips for oneself
DROP POLICY IF EXISTS trips_insert_own ON public.trips;
CREATE POLICY trips_insert_own ON public.trips
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update: only owner can update
DROP POLICY IF EXISTS trips_update_own ON public.trips;
CREATE POLICY trips_update_own ON public.trips
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Delete: only owner can delete
DROP POLICY IF EXISTS trips_delete_own ON public.trips;
CREATE POLICY trips_delete_own ON public.trips
FOR DELETE
USING (auth.uid() = user_id);


-- =========================================
-- Policies for public.cards
-- =========================================

-- Select: users can view cards of their own trips
DROP POLICY IF EXISTS cards_select_by_trip_owner ON public.cards;
CREATE POLICY cards_select_by_trip_owner ON public.cards
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = cards.trip_id
      AND t.user_id = auth.uid()
  )
);

-- Insert: users can insert cards into trips they own
DROP POLICY IF EXISTS cards_insert_by_trip_owner ON public.cards;
CREATE POLICY cards_insert_by_trip_owner ON public.cards
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = trip_id
      AND t.user_id = auth.uid()
  )
);

-- Update: users can update cards in trips they own
DROP POLICY IF EXISTS cards_update_by_trip_owner ON public.cards;
CREATE POLICY cards_update_by_trip_owner ON public.cards
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = cards.trip_id
      AND t.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = trip_id
      AND t.user_id = auth.uid()
  )
);

-- Delete: users can delete cards in trips they own
DROP POLICY IF EXISTS cards_delete_by_trip_owner ON public.cards;
CREATE POLICY cards_delete_by_trip_owner ON public.cards
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = cards.trip_id
      AND t.user_id = auth.uid()
  )
);


-- =========================================
-- Policies for public.card_versions
-- =========================================

-- Select: users can view versions of cards belonging to their own trips
DROP POLICY IF EXISTS card_versions_select_by_trip_owner ON public.card_versions;
CREATE POLICY card_versions_select_by_trip_owner ON public.card_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.cards c
    JOIN public.trips t ON t.id = c.trip_id
    WHERE c.id = card_versions.card_id
      AND t.user_id = auth.uid()
  )
);

-- Insert: users can insert versions only for cards belonging to their own trips
DROP POLICY IF EXISTS card_versions_insert_by_trip_owner ON public.card_versions;
CREATE POLICY card_versions_insert_by_trip_owner ON public.card_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cards c
    JOIN public.trips t ON t.id = c.trip_id
    WHERE c.id = card_id
      AND t.user_id = auth.uid()
  )
);

-- Update: usually versions are immutable; if needed, restrict updates to own cards
DROP POLICY IF EXISTS card_versions_update_by_trip_owner ON public.card_versions;
CREATE POLICY card_versions_update_by_trip_owner ON public.card_versions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.cards c
    JOIN public.trips t ON t.id = c.trip_id
    WHERE c.id = card_versions.card_id
      AND t.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cards c
    JOIN public.trips t ON t.id = c.trip_id
    WHERE c.id = card_id
      AND t.user_id = auth.uid()
  )
);

-- Delete: restrict to own cards
DROP POLICY IF EXISTS card_versions_delete_by_trip_owner ON public.card_versions;
CREATE POLICY card_versions_delete_by_trip_owner ON public.card_versions
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.cards c
    JOIN public.trips t ON t.id = c.trip_id
    WHERE c.id = card_versions.card_id
      AND t.user_id = auth.uid()
  )
);


-- =========================================
-- Policies for public.connections
-- =========================================

-- Select: users can view connections for trips they own
DROP POLICY IF EXISTS connections_select_by_trip_owner ON public.connections;
CREATE POLICY connections_select_by_trip_owner ON public.connections
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = connections.trip_id
      AND t.user_id = auth.uid()
  )
);

-- Insert: users can create connections only within trips they own
DROP POLICY IF EXISTS connections_insert_by_trip_owner ON public.connections;
CREATE POLICY connections_insert_by_trip_owner ON public.connections
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = trip_id
      AND t.user_id = auth.uid()
  )
);

-- Update: users can update connections only within trips they own
DROP POLICY IF EXISTS connections_update_by_trip_owner ON public.connections;
CREATE POLICY connections_update_by_trip_owner ON public.connections
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = connections.trip_id
      AND t.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = trip_id
      AND t.user_id = auth.uid()
  )
);

-- Delete: users can delete connections only within trips they own
DROP POLICY IF EXISTS connections_delete_by_trip_owner ON public.connections;
CREATE POLICY connections_delete_by_trip_owner ON public.connections
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = connections.trip_id
      AND t.user_id = auth.uid()
  )
);