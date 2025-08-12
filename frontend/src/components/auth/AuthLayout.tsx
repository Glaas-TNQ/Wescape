import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';
import VideoBackground from '../ui/VideoBackground';

const AuthLayout: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative">
      {/* Video Background */}
      <VideoBackground opacity={0.8} />

      {/* Theme toggle in top right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Triptify logo/title */}
      <div className="absolute top-6 left-6 z-20">
        <div className="flex items-center gap-3">
          <img 
            src="/logo_transparent.png" 
            alt="Triptify" 
            className="w-10 h-10 floating"
          />
          <h1 className="text-2xl font-bold text-wescape-text tracking-wide">
            Triptify
          </h1>
        </div>
      </div>

      {/* Auth forms container */}
      <div className="relative z-10 w-full max-w-md">
        {isLogin ? (
          <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
        ) : (
          <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
        
        {/* App description */}
        <div className="mt-8 text-center text-sm glass-effect rounded-wescape p-4">
          <p className="text-wescape-muted leading-relaxed">
            ✈️ Pianifica i tuoi viaggi con l'aiuto dell'IA<br />
            🎨 Canvas interattivo per organizzare ogni dettaglio<br />
            🗺️ Trasforma le tue idee in avventure indimenticabili
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;