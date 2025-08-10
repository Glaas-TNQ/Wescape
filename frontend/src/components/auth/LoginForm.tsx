import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToastContext } from '../../contexts/ToastContext';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToastContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      showToast('Inserisci email e password', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Login effettuato con successo!', 'success');
      }
    } catch {
      showToast('Errore durante il login', 'error');
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
          Accedi a WeScape
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
              placeholder="inserisci la tua password"
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
                ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Accesso in corso...
              </span>
            ) : (
              'Accedi'
            )}
          </button>
        </form>
        
        <div className={`
          mt-6 text-center text-sm
          ${isDark ? 'text-white/70' : 'text-gray-600'}
        `}>
          Non hai un account?{' '}
          <button
            onClick={onSwitchToSignup}
            className={`
              font-medium transition-colors hover:underline
              ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}
            `}
          >
            Registrati
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;