import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  
  const { user } = useAuth();
  const { showToast } = useToastContext();

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If no profile exists, create one
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: user.id,
                display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utente',
              },
            ])
            .select()
            .single();

          if (createError) {
            throw createError;
          }
          
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nel caricamento del profilo';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'display_name' | 'bio' | 'preferences'>>) => {
    if (!user || !profile) {
      showToast('Profilo utente non caricato', 'error');
      return false;
    }

    try {
      setUpdating(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      showToast('Profilo aggiornato con successo!', 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nell\'aggiornamento del profilo';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error updating profile:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) {
      showToast('Devi essere loggato per caricare un avatar', 'error');
      return null;
    }

    try {
      setUpdating(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Il file deve essere un\'immagine', 'error');
        return null;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Il file non può superare i 5MB', 'error');
        return null;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

      const avatarUrl = urlData.publicUrl;

      // Update profile with new avatar URL
      const success = await updateProfile({ avatar_url: avatarUrl });
      
      if (success) {
        return avatarUrl;
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nel caricamento dell\'avatar';
      showToast(errorMessage, 'error');
      console.error('Error uploading avatar:', err);
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const removeAvatar = async () => {
    if (!user || !profile?.avatar_url) return false;

    try {
      setUpdating(true);

      // Update profile to remove avatar URL
      const success = await updateProfile({ avatar_url: null });
      
      if (success) {
        // Try to delete the file from storage (optional, as it will be overwritten anyway)
        try {
          const fileName = profile.avatar_url.split('/').pop();
          if (fileName) {
            await supabase.storage
              .from('avatars')
              .remove([`${user.id}/${fileName}`]);
          }
        } catch {
          // Ignore storage deletion errors
        }
        
        showToast('Avatar rimosso', 'success');
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nella rimozione dell\'avatar';
      showToast(errorMessage, 'error');
      console.error('Error removing avatar:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Fetch profile when user changes
  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    updating,
    refetch: fetchProfile,
    updateProfile,
    uploadAvatar,
    removeAvatar,
  };
};