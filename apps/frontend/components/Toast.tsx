'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  const colors = {
    success: { bg: '#10b981', border: '#059669' },
    error: { bg: '#ef4444', border: '#dc2626' },
    info: { bg: '#3b82f6', border: '#2563eb' },
  };

  return (
    <div className="toast" style={{ 
      background: colors[type].bg,
      borderColor: colors[type].border 
    }}>
      <div className="toast-icon">{icons[type]}</div>
      <p className="toast-message">{message}</p>
      <button onClick={onClose} className="toast-close" aria-label="Fermer">
        <X size={18} />
      </button>

      <style jsx>{`
        .toast {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 10000;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-radius: var(--radius-lg, 12px);
          border: 2px solid;
          color: white;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          min-width: 300px;
          max-width: 500px;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .toast-icon {
          flex-shrink: 0;
          display: flex;
        }

        .toast-message {
          flex: 1;
          margin: 0;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .toast-close {
          flex-shrink: 0;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius, 8px);
          transition: background 0.2s;
        }

        .toast-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 640px) {
          .toast {
            top: 1rem;
            right: 1rem;
            left: 1rem;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}
