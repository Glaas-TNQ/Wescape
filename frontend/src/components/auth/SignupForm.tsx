import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();
  const { showToast } = useToastContext();

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !fullName) {
      showToast('Compila tutti i campi obbligatori', 'error');
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
      const { error } = await signUp(email, password, fullName, username);
      
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Registrazione completata! Controlla la tua email per confermare l\'account.', 'success');
        // Reset form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setUsername('');
      }
    } catch {
      showToast('Errore durante la registrazione', 'error');
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
              Inizia oggi
            </h2>
          </div>
          <p className="text-wescape-muted text-sm">
            Crea il tuo account Triptify gratuitamente
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="group">
            <label className="block text-sm font-medium mb-2 text-wescape-text">
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-wescape-muted">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Nome Completo *
              </span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-wescape glass-effect text-wescape-text placeholder-wescape-muted transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-wescape-brand/50 wescape-hover disabled:opacity-50"
              placeholder="es. Mario Rossi"
              disabled={isLoading}
            />
          </div>

          <div className="group">
            <label className="block text-sm font-medium mb-2 text-wescape-text">
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-wescape-muted">
                  <path d="M12 12s-3-1-6-1-6 2-6 2 3 1 6 1 6-2 6-2z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 5s3-1 6-1 6 2 6 2-3 1-6 1-6-2-6-2z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Username (opzionale)
              </span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-wescape glass-effect text-wescape-text placeholder-wescape-muted transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-wescape-brand/50 wescape-hover disabled:opacity-50"
              placeholder="es. mariorossi"
              disabled={isLoading}
            />
          </div>

          <div className="group">
            <label className="block text-sm font-medium mb-2 text-wescape-text">
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-wescape-muted">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Email *
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
                Password *
              </span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-wescape glass-effect text-wescape-text placeholder-wescape-muted transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-wescape-brand/50 wescape-hover disabled:opacity-50"
              placeholder="crea una password (min. 6 caratteri)"
              disabled={isLoading}
            />
          </div>
          
          <div className="group">
            <label className="block text-sm font-medium mb-2 text-wescape-text">
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-wescape-muted">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Conferma Password *
              </span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-wescape glass-effect text-wescape-text placeholder-wescape-muted transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-wescape-brand/50 wescape-hover disabled:opacity-50"
              placeholder="conferma la password"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-wescape font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-wescape-success/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 glass-effect-strong text-wescape-text hover:text-white ripple-effect mt-6"
            style={{ background: 'linear-gradient(135deg, var(--wescape-success), #16a34a)' }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creazione account...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Crea Account Gratuito
              </span>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-wescape-border"></div>
            <span className="text-xs text-wescape-muted font-medium">GIÀ REGISTRATO?</span>
            <div className="flex-1 h-px bg-wescape-border"></div>
          </div>
          
          <p className="text-sm text-wescape-muted">
            Hai già un account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-medium text-wescape-brand hover:text-white transition-all duration-300 hover:underline"
            >
              Accedi qui
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;