import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';

export type Trip = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  currency: string | null;
  visibility: string | null;
  cover_image: string | null;
  settings: any | null;
  metadata: any | null;
  created_at: string;
  updated_at: string;
}

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { showToast } = useToastContext();

  const fetchTrips = async () => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTrips(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nel caricamento dei trip';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (title: string, description?: string, coverImage?: string) => {
    if (!user) {
      showToast('Devi essere loggato per creare un trip', 'error');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('trips')
        .insert([
          {
            title,
            description: description || null,
            cover_image: coverImage || null,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add to local state
      setTrips(prev => [data, ...prev]);
      showToast('Trip creato con successo!', 'success');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nella creazione del trip';
      showToast(errorMessage, 'error');
      console.error('Error creating trip:', err);
      return null;
    }
  };

  const updateTrip = async (id: string, updates: Partial<Pick<Trip, 'title' | 'description'>>) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setTrips(prev => prev.map(trip => trip.id === id ? data : trip));
      showToast('Trip aggiornato!', 'success');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nell\'aggiornamento del trip';
      showToast(errorMessage, 'error');
      console.error('Error updating trip:', err);
      return null;
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      // Remove from local state
      setTrips(prev => prev.filter(trip => trip.id !== id));
      showToast('Trip eliminato', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nell\'eliminazione del trip';
      showToast(errorMessage, 'error');
      console.error('Error deleting trip:', err);
    }
  };

  // Fetch trips when user changes
  useEffect(() => {
    fetchTrips();
  }, [user]);

  return {
    trips,
    loading,
    error,
    refetch: fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
  };
};