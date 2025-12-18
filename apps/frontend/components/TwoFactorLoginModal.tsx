'use client';

import { useState, useRef } from 'react';
import { X, Shield } from 'lucide-react';

interface TwoFactorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  error?: string | null;
}

export default function TwoFactorLoginModal({
  isOpen,
  onClose,
  onVerify,
  error = null,
}: TwoFactorLoginModalProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newCode.every((digit) => digit !== '') && newCode.length === 6) {
      onVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pastedData.split('');
    
    while (newCode.length < 6) {
      newCode.push('');
    }
    
    setCode(newCode);
    
    // Focus the first empty input or the last one
    const firstEmpty = newCode.findIndex((digit) => !digit);
    if (firstEmpty >= 0) {
      inputsRef.current[firstEmpty]?.focus();
    } else {
      inputsRef.current[5]?.focus();
      // Auto-submit if all filled
      if (newCode.every((digit) => digit !== '')) {
        onVerify(newCode.join(''));
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-login-2fa" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          <X size={24} />
        </button>

        <div className="modal-header">
          <div className="modal-icon">
            <Shield size={32} />
          </div>
          <h2>Authentification à deux facteurs</h2>
          <p>Entrez le code à 6 chiffres de votre application d'authentification</p>
        </div>

        <div className="modal-body">
          <div className="code-inputs" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputsRef.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="code-input"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="modal-hint">
            <p>💡 Vous pouvez aussi coller le code directement</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content-login-2fa {
          background: var(--card, #ffffff);
          border-radius: var(--radius-xl, 16px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 450px;
          width: 100%;
          position: relative;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--muted-foreground, #666);
          padding: 0.5rem;
          border-radius: var(--radius-lg, 12px);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: var(--muted, #f3f4f6);
          color: var(--foreground, #000);
        }

        .modal-header {
          text-align: center;
          padding: 2rem 2rem 1rem;
        }

        .modal-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--primary-500, #3b82f6), var(--primary-600, #2563eb));
          border-radius: var(--radius-xl, 16px);
          color: white;
          margin-bottom: 1rem;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          color: var(--foreground, #000);
        }

        .modal-header p {
          color: var(--muted-foreground, #666);
          font-size: 0.9rem;
          margin: 0;
        }

        .modal-body {
          padding: 2rem;
        }

        .code-inputs {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .code-input {
          width: 3rem;
          height: 3.5rem;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 600;
          border: 2px solid var(--border, #e5e7eb);
          border-radius: var(--radius-lg, 12px);
          transition: all 0.2s;
          font-family: monospace;
        }

        .code-input:focus {
          outline: none;
          border-color: var(--primary-500, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .error-message {
          background: #fee;
          color: #c44;
          padding: 0.75rem;
          border-radius: var(--radius-lg, 12px);
          text-align: center;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .modal-hint {
          text-align: center;
        }

        .modal-hint p {
          color: var(--muted-foreground, #666);
          font-size: 0.85rem;
          margin: 0;
        }

        @media (max-width: 640px) {
          .modal-content-login-2fa {
            max-width: 90vw;
          }

          .code-input {
            width: 2.5rem;
            height: 3rem;
            font-size: 1.25rem;
          }

          .code-inputs {
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
