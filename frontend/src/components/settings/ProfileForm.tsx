import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToastContext } from '../../contexts/ToastContext';
import { useUserProfile } from '../../hooks/useUserProfile';

const ProfileForm: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isDark } = useTheme();
  const { showToast } = useToastContext();
  const { 
    profile, 
    loading, 
    updating, 
    updateProfile, 
    uploadAvatar, 
    removeAvatar 
  } = useUserProfile();

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      showToast('Il nome è obbligatorio', 'error');
      return;
    }

    if (displayName.length > 100) {
      showToast('Il nome non può superare i 100 caratteri', 'error');
      return;
    }

    if (bio.length > 500) {
      showToast('La bio non può superare i 500 caratteri', 'error');
      return;
    }

    const success = await updateProfile({
      display_name: displayName.trim(),
      bio: bio.trim() || null,
    });

    if (success) {
      setIsEditing(false);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    await removeAvatar();
  };

  const handleCancel = () => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className={`
          w-6 h-6 border-2 border-t-transparent rounded-full animate-spin
          ${isDark ? 'border-white' : 'border-gray-900'}
        `}></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className={isDark ? 'text-white/60' : 'text-gray-600'}>
          Errore nel caricamento del profilo
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className={`
            w-20 h-20 rounded-full overflow-hidden border-2 cursor-pointer transition-all
            ${isDark ? 'border-white/20' : 'border-gray-200'}
            ${updating ? 'opacity-50' : 'group-hover:border-blue-500/50'}
          `}
          onClick={handleAvatarClick}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`
                w-full h-full flex items-center justify-center text-2xl
                ${isDark ? 'bg-white/10' : 'bg-gray-100'}
              `}>
                👤
              </div>
            )}
          </div>
          
          {/* Avatar overlay */}
          <div className={`
            absolute inset-0 rounded-full flex items-center justify-center 
            opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer
            bg-black/50 text-white text-xs font-medium
          `}
          onClick={handleAvatarClick}
          >
            {updating ? '...' : 'Cambia'}
          </div>
        </div>

        <div className="flex-1">
          <h3 className={`
            text-lg font-medium
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            {profile.display_name || 'Nome utente'}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleAvatarClick}
              disabled={updating}
              className={`
                text-sm font-medium transition-colors
                ${isDark 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'
                }
                ${updating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {updating ? 'Caricamento...' : 'Carica foto'}
            </button>
            {profile.avatar_url && (
              <>
                <span className={isDark ? 'text-white/40' : 'text-gray-400'}>•</span>
                <button
                  onClick={handleRemoveAvatar}
                  disabled={updating}
                  className={`
                    text-sm font-medium transition-colors
                    ${isDark 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-red-600 hover:text-red-700'
                    }
                    ${updating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  Rimuovi
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display Name */}
        <div>
          <label className={`
            block text-sm font-medium mb-2
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            Nome visualizzato
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Il tuo nome"
            maxLength={100}
            disabled={!isEditing || updating}
            className={`
              w-full px-4 py-3 rounded-lg border transition-all
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              ${isDark
                ? 'bg-white/5 border-white/10 text-white placeholder-white/50'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              }
              ${(!isEditing || updating) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          <div className="flex justify-between items-center mt-1">
            <span className={`
              text-xs
              ${isDark ? 'text-white/50' : 'text-gray-400'}
            `}>
              {displayName.length}/100 caratteri
            </span>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className={`
            block text-sm font-medium mb-2
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            Bio (opzionale)
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Raccontaci qualcosa di te..."
            rows={3}
            maxLength={500}
            disabled={!isEditing || updating}
            className={`
              w-full px-4 py-3 rounded-lg border transition-all resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              ${isDark
                ? 'bg-white/5 border-white/10 text-white placeholder-white/50'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              }
              ${(!isEditing || updating) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          <div className="flex justify-between items-center mt-1">
            <span className={`
              text-xs
              ${isDark ? 'text-white/50' : 'text-gray-400'}
            `}>
              {bio.length}/500 caratteri
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                ${isDark
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              `}
            >
              Modifica Profilo
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={updating}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-all
                  border hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500/50
                  ${isDark
                    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }
                  ${updating ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                Annulla
              </button>
              
              <button
                type="submit"
                disabled={updating || !displayName.trim()}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-all
                  hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  flex items-center justify-center gap-2
                  ${isDark
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }
                  ${(updating || !displayName.trim()) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                  }
                `}
              >
                {updating && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                {updating ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
            </>
          )}
        </div>
      </form>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ProfileForm;