import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';
import { type ToastMessage } from '../components/ui/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastMessage['type'], duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, removeToast, toast } = useToast();

  const showToast = (message: string, type: ToastMessage['type'] = 'info', duration?: number) => {
    switch (type) {
      case 'success':
        toast.success(message, duration);
        break;
      case 'error':
        toast.error(message, duration);
        break;
      case 'warning':
        toast.warning(message, duration);
        break;
      default:
        toast.info(message, duration);
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};