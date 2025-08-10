import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';

const AuthLayout: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isDark } = useTheme();

  return (
    <div className={`
      min-h-screen w-full flex items-center justify-center p-4 transition-colors
      ${isDark ? 'bg-black' : 'bg-gray-50'}
    `}>
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`
          absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl
          ${isDark ? 'bg-blue-500' : 'bg-blue-300'}
        `} />
        <div className={`
          absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl
          ${isDark ? 'bg-purple-500' : 'bg-purple-300'}
        `} />
      </div>

      {/* Theme toggle in top right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* WeScape logo/title */}
      <div className="absolute top-6 left-6">
        <h1 className={`
          text-2xl font-bold transition-colors
          ${isDark ? 'text-white' : 'text-gray-900'}
        `}>
          🗺️ WeScape
        </h1>
      </div>

      {/* Auth forms container */}
      <div className="relative z-10 w-full max-w-md">
        {isLogin ? (
          <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
        ) : (
          <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
        
        {/* App description */}
        <div className={`
          mt-8 text-center text-sm
          ${isDark ? 'text-white/60' : 'text-gray-500'}
        `}>
          <p>
            Pianifica i tuoi viaggi con l'aiuto dell'IA.<br />
            Canvas interattivo per organizzare ogni dettaglio del tuo trip.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;