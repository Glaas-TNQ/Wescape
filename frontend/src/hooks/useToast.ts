import { useState, useCallback } from 'react';
import { type ToastMessage } from '../components/ui/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
  };

  return { toasts, removeToast, toast };
};

export default useToast;