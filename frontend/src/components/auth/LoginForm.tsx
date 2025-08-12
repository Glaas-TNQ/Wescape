import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn } = useAuth();
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
      <div className="glass-effect-strong rounded-wescape p-8 modal-enter">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/logo_transparent.png" 
              alt="Triptify" 
              className="w-12 h-12 floating"
            />
            <h2 className="text-3xl font-bold text-wescape-text tracking-wide">
              Bentornato
            </h2>
          </div>
          <p className="text-wescape-muted text-sm">
            Accedi al tuo account Triptify
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label className="block text-sm font-medium mb-2 text-wescape-text">
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-wescape-muted">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Email
              </span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-wescape glass-effect text-wescape-text placeholder-wescape-muted transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-wescape-brand/50 wescape-hover disabled:opacity-50"
              placeholder="la tua email"
              disabled={isLoading}
            />
          </div>
          
          <div className="group">
            <label className="block text-sm font-medium mb-2 text-wescape-text">
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-wescape-muted">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Password
              </span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-wescape glass-effect text-wescape-text placeholder-wescape-muted transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-wescape-brand/50 wescape-hover disabled:opacity-50"
              placeholder="la tua password"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-wescape font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-wescape-brand/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 glass-effect-strong text-wescape-text hover:text-white ripple-effect mt-6"
            style={{ background: 'linear-gradient(135deg, var(--wescape-brand), var(--wescape-brand-quiet))' }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Accesso in corso...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <polyline points="10,17 15,12 10,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Accedi
              </span>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-wescape-border"></div>
            <span className="text-xs text-wescape-muted font-medium">OPPURE</span>
            <div className="flex-1 h-px bg-wescape-border"></div>
          </div>
          
          <p className="text-sm text-wescape-muted">
            Non hai un account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="font-medium text-wescape-brand hover:text-white transition-all duration-300 hover:underline"
            >
              Registrati gratis
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;