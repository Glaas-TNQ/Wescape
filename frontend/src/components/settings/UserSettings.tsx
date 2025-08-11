import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import ThemeToggle from '../ui/ThemeToggle';
import ProfileForm from './ProfileForm';

interface UserSettingsProps {
  onBack?: () => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ onBack }) => {
  const { user, signOut } = useAuth();
  const { isDark } = useTheme();
  const { profile, loading } = useUserProfile();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className={`
        min-h-screen w-full flex items-center justify-center transition-colors
        ${isDark ? 'bg-black' : 'bg-gray-50'}
      `}>
        <div className="flex items-center gap-3">
          <div className={`
            w-6 h-6 border-2 border-t-transparent rounded-full animate-spin
            ${isDark ? 'border-white' : 'border-gray-900'}
          `}></div>
          <span className={isDark ? 'text-white' : 'text-gray-900'}>
            Caricamento profilo...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      min-h-screen w-full transition-colors
      ${isDark ? 'bg-black' : 'bg-gray-50'}
    `}>
      {/* Header */}
      <header className={`
        flex items-center justify-between p-6 border-b
        ${isDark ? 'border-white/10' : 'border-gray-200'}
      `}>
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className={`
                p-2 rounded-lg transition-all hover:scale-110
                ${isDark 
                  ? 'text-white/60 hover:text-white hover:bg-white/10' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }
              `}
              title="Torna alla dashboard"
            >
              ← 
            </button>
          )}
          <h1 className={`
            text-2xl font-bold
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}>
            ⚙️ Impostazioni
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`
            text-sm px-3 py-1 rounded-full
            ${isDark ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-600'}
          `}>
            {user?.email}
          </span>
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 border
              ${isDark 
                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2">
            <div className={`
              rounded-2xl p-6 border
              ${isDark ? 'bg-black/50 border-white/10' : 'bg-white border-gray-200'}
            `}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${isDark ? 'bg-white/10' : 'bg-gray-100'}
                `}>
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h2 className={`
                    text-lg font-semibold
                    ${isDark ? 'text-white' : 'text-gray-900'}
                  `}>
                    Profilo Utente
                  </h2>
                  <p className={`
                    text-sm
                    ${isDark ? 'text-white/60' : 'text-gray-600'}
                  `}>
                    Gestisci le informazioni del tuo account
                  </p>
                </div>
              </div>
              
              <ProfileForm />
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className={`
              rounded-2xl p-6 border
              ${isDark ? 'bg-black/50 border-white/10' : 'bg-white border-gray-200'}
            `}>
              <h3 className={`
                font-semibold mb-4
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}>
                Informazioni Account
              </h3>
              <div className="space-y-3">
                <div>
                  <label className={`
                    text-xs font-medium uppercase tracking-wide
                    ${isDark ? 'text-white/60' : 'text-gray-500'}
                  `}>
                    Email
                  </label>
                  <p className={`
                    text-sm
                    ${isDark ? 'text-white' : 'text-gray-900'}
                  `}>
                    {user?.email}
                  </p>
                </div>
                <div>
                  <label className={`
                    text-xs font-medium uppercase tracking-wide
                    ${isDark ? 'text-white/60' : 'text-gray-500'}
                  `}>
                    ID Utente
                  </label>
                  <p className={`
                    text-xs font-mono break-all
                    ${isDark ? 'text-white/60' : 'text-gray-600'}
                  `}>
                    {user?.id}
                  </p>
                </div>
                {profile && (
                  <div>
                    <label className={`
                      text-xs font-medium uppercase tracking-wide
                      ${isDark ? 'text-white/60' : 'text-gray-500'}
                    `}>
                      Registrato il
                    </label>
                    <p className={`
                      text-sm
                      ${isDark ? 'text-white' : 'text-gray-900'}
                    `}>
                      {new Date(profile.created_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Theme Settings */}
            <div className={`
              rounded-2xl p-6 border
              ${isDark ? 'bg-black/50 border-white/10' : 'bg-white border-gray-200'}
            `}>
              <h3 className={`
                font-semibold mb-4
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}>
                Preferenze
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`
                    text-sm font-medium
                    ${isDark ? 'text-white' : 'text-gray-900'}
                  `}>
                    Tema
                  </p>
                  <p className={`
                    text-xs
                    ${isDark ? 'text-white/60' : 'text-gray-600'}
                  `}>
                    {isDark ? 'Scuro' : 'Chiaro'}
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* Danger Zone */}
            <div className={`
              rounded-2xl p-6 border border-red-500/20
              ${isDark ? 'bg-red-500/5' : 'bg-red-50'}
            `}>
              <h3 className="font-semibold mb-4 text-red-600">
                Zona di Pericolo
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleSignOut}
                  className={`
                    w-full px-4 py-2 rounded-lg font-medium transition-all
                    border border-red-500/30 text-red-600 hover:bg-red-500/10
                  `}
                >
                  Logout da Tutti i Dispositivi
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserSettings;