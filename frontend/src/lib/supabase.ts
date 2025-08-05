import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Minimal placeholder for future realtime usage
export const subscribeToTrip = (
  tripId: string,
  onCardChange: (payload: any) => void,
  onConnectionChange: (payload: any) => void
) => {
  const channel = supabase
    .channel(`trip-${tripId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cards', filter: `trip_id=eq.${tripId}` },
      onCardChange
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'connections', filter: `trip_id=eq.${tripId}` },
      onConnectionChange
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};