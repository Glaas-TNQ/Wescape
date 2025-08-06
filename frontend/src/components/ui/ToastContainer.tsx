import React from 'react';
import Toast, { type ToastMessage } from './Toast';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 w-80">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

export default ToastContainer;