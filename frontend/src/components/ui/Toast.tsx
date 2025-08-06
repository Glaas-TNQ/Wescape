import React, { useState, useEffect } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto close
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(toast.id), 300);
    }, toast.duration || 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [toast.id, toast.duration, onClose]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-500/50 bg-green-900/90 text-green-100';
      case 'error':
        return 'border-red-500/50 bg-red-900/90 text-red-100';
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-900/90 text-yellow-100';
      default:
        return 'border-blue-500/50 bg-blue-900/90 text-blue-100';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-lg border backdrop-blur-lg transition-all duration-300
        ${getToastStyles()}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <span className="text-lg flex-shrink-0">{getIcon()}</span>
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(toast.id), 300);
        }}
        className="ml-auto flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded text-xs"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;