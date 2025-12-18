'use client';

import { useState } from 'react';
import { X, Copy, Check, Shield } from 'lucide-react';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string;
  secret: string;
  onVerify: (code: string) => void;
}

export default function TwoFactorModal({
  isOpen,
  onClose,
  qrCode,
  secret,
  onVerify,
}: TwoFactorModalProps) {
  const [totpCode, setTotpCode] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length === 6) {
      onVerify(totpCode);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-two-factor" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          <X size={24} />
        </button>

        <div className="modal-header">
          <div className="modal-icon">
            <Shield size={32} />
          </div>
          <h2>Configurer l'authentification à deux facteurs</h2>
          <p>Scannez le QR code avec votre application d'authentification</p>
        </div>

        <div className="modal-body">
          <div className="qr-section">
            <div className="qr-code">
              <img src={qrCode} alt="QR Code 2FA" />
            </div>
            <p className="qr-instructions">
              Utilisez Google Authenticator, Authy, ou toute autre application TOTP
            </p>
          </div>

          <div className="secret-section">
            <label>Clé secrète (configuration manuelle)</label>
            <div className="secret-input-group">
              <input
                type="text"
                value={secret}
                readOnly
                className="secret-input"
              />
              <button
                type="button"
                onClick={handleCopySecret}
                className="copy-button"
                aria-label="Copier la clé"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="verify-form">
            <label htmlFor="totp-code">Code de vérification</label>
            <input
              id="totp-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="totp-input"
              autoFocus
            />
            <button
              type="submit"
              disabled={totpCode.length !== 6}
              className="verify-button"
            >
              Activer la 2FA
            </button>
          </form>
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

        .modal-content {
          background: var(--card, #ffffff);
          border-radius: var(--radius-xl, 16px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 500px;
          width: 100%;
          position: relative;
          animation: slideUp 0.3s ease-out;
        }

        .modal-content-two-factor {
          background: var(--card, #ffffff);
          border-radius: var(--radius-xl, 16px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 500px;
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

        .qr-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .qr-code {
          display: inline-block;
          padding: 1rem;
          background: white;
          border-radius: var(--radius-lg, 12px);
          border: 2px solid var(--border, #e5e7eb);
          margin-bottom: 1rem;
        }

        .qr-code img {
          display: block;
          width: 250px;
          height: 250px;
        }

        .qr-instructions {
          font-size: 0.875rem;
          color: var(--muted-foreground, #666);
          margin: 0;
        }

        .secret-section {
          margin-bottom: 2rem;
        }

        .secret-section label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--foreground, #000);
          font-size: 0.9rem;
        }

        .secret-input-group {
          display: flex;
          gap: 0.5rem;
        }

        .secret-input {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid var(--border, #e5e7eb);
          border-radius: var(--radius-lg, 12px);
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          background: var(--muted, #f3f4f6);
          color: var(--foreground, #000);
        }

        .copy-button {
          padding: 0.75rem 1rem;
          border: 2px solid var(--border, #e5e7eb);
          border-radius: var(--radius-lg, 12px);
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--foreground, #000);
        }

        .copy-button:hover {
          background: var(--muted, #f3f4f6);
          border-color: var(--primary-500, #3b82f6);
        }

        .verify-form label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--foreground, #000);
          font-size: 0.9rem;
        }

        .totp-input {
          width: 100%;
          padding: 1rem;
          border: 2px solid var(--border, #e5e7eb);
          border-radius: var(--radius-lg, 12px);
          font-size: 1.5rem;
          text-align: center;
          letter-spacing: 0.5rem;
          font-family: 'Courier New', monospace;
          margin-bottom: 1rem;
          transition: all 0.2s;
        }

        .totp-input:focus {
          outline: none;
          border-color: var(--primary-500, #3b82f6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .verify-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, var(--primary-500, #3b82f6), var(--primary-600, #2563eb));
          color: white;
          border: none;
          border-radius: var(--radius-lg, 12px);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .verify-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }

        .verify-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .modal-content {
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-content-two-factor {
            max-height: 35em;
            overflow-y: auto;
          }

          .qr-code img {
            width: 200px;
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}
