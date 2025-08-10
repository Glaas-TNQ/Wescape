import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToastContext } from '../../contexts/ToastContext';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToastContext();

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      showToast('Compila tutti i campi', 'error');
      return false;
    }

    if (password.length < 6) {
      showToast('La password deve essere di almeno 6 caratteri', 'error');
      return false;
    }

    if (password !== confirmPassword) {
      showToast('Le password non coincidono', 'error');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Inserisci un indirizzo email valido', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Registrazione completata! Controlla la tua email per confermare l\'account.', 'success');
        // Reset form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch {
      showToast('Errore durante la registrazione', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className={`
        p-8 rounded-xl border backdrop-blur-sm
        ${isDark 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/80 border-gray-200'
        }
      `}>
        <h2 className={`
          text-2xl font-bold text-center mb-6
          ${isDark ? 'text-white' : 'text-gray-900'}
        `}>
          Registrati a WeScape
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${isDark ? 'text-white/90' : 'text-gray-700'}
            `}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`
                w-full px-4 py-3 rounded-lg border transition-all
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                ${isDark 
                  ? 'bg-white/10 border-white/20 text-white placeholder-white/50' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
              `}
              placeholder="inserisci la tua email"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${isDark ? 'text-white/90' : 'text-gray-700'}
            `}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`
                w-full px-4 py-3 rounded-lg border transition-all
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                ${isDark 
                  ? 'bg-white/10 border-white/20 text-white placeholder-white/50' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
              `}
              placeholder="crea una password (min. 6 caratteri)"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className={`
              block text-sm font-medium mb-2
              ${isDark ? 'text-white/90' : 'text-gray-700'}
            `}>
              Conferma Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`
                w-full px-4 py-3 rounded-lg border transition-all
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                ${isDark 
                  ? 'bg-white/10 border-white/20 text-white placeholder-white/50' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }
              `}
              placeholder="conferma la password"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-3 px-4 rounded-lg font-medium transition-all
              hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              ${isDark 
                ? 'bg-green-600 hover:bg-green-500 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Registrazione in corso...
              </span>
            ) : (
              'Registrati'
            )}
          </button>
        </form>
        
        <div className={`
          mt-6 text-center text-sm
          ${isDark ? 'text-white/70' : 'text-gray-600'}
        `}>
          Hai già un account?{' '}
          <button
            onClick={onSwitchToLogin}
            className={`
              font-medium transition-colors hover:underline
              ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}
            `}
          >
            Accedi
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;