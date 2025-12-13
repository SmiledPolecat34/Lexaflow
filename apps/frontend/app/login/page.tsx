'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoginForm {
  email: string;
  password: string;
  totpCode?: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const { login, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    const result = await login(data);
    if (result?.requires2FA) {
      setRequires2FA(true);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-card animate-slideUp">
          <div className="auth-header">
            <Link href="/" className="auth-logo">
              🎓 LexaFlow
            </Link>
            <h1>Bon retour !</h1>
            <p>Connectez-vous pour continuer votre apprentissage</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="votre@email.com"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email requis',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Email invalide',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Mot de passe requis',
                  })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {requires2FA && (
              <div className="form-group animate-slideUp">
                <label htmlFor="totpCode" className="form-label">
                  Code 2FA
                </label>
                <input
                  id="totpCode"
                  type="text"
                  className="form-input"
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="one-time-code"
                  {...register('totpCode', {
                    required: 'Code 2FA requis',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Le code doit contenir 6 chiffres',
                    },
                  })}
                />
                {errors.totpCode && (
                  <p className="form-error">{errors.totpCode.message}</p>
                )}
              </div>
            )}

            <div className="form-actions">
              <Link href="/forgot-password" className="forgot-link">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg full-width"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>

            <div className="divider">
              <span>ou</span>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-lg full-width google-btn"
              onClick={() => {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                window.location.href = `${apiUrl}/api/auth/google`;
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuer avec Google
            </button>
          </form>

          <p className="auth-footer">
            Pas encore de compte ?{' '}
            <Link href="/register">Créer un compte</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-50), var(--secondary-50));
          padding: 2rem;
        }

        .auth-container {
          width: 100%;
          max-width: 420px;
        }

        .auth-card {
          background: var(--card);
          border-radius: var(--radius-2xl);
          padding: 2.5rem;
          box-shadow: var(--shadow-xl);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
          display: block;
          margin-bottom: 1.5rem;
        }

        .auth-header h1 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          color: var(--muted-foreground);
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted-foreground);
        }

        .input-with-icon .form-input {
          padding-left: 2.5rem;
          padding-right: 2.5rem;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--muted-foreground);
          cursor: pointer;
          padding: 0.25rem;
        }

        .password-toggle:hover {
          color: var(--foreground);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1rem;
        }

        .forgot-link {
          font-size: 0.875rem;
          color: var(--primary-600);
        }

        .full-width {
          width: 100%;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
          color: var(--muted-foreground);
          font-size: 0.875rem;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .auth-footer {
          text-align: center;
          margin-top: 1.5rem;
          color: var(--muted-foreground);
        }

        .auth-footer a {
          color: var(--primary-600);
          font-weight: 500;
        }

        .alert {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-lg);
          margin-bottom: 1rem;
        }

        .alert-error {
          background: var(--error-100);
          color: var(--error-700);
          border: 1px solid var(--error-200);
        }
      `}</style>
    </main>
  );
}
