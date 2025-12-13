'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  consent: boolean;
}

const passwordRequirements = [
  { id: 'length', label: 'Au moins 8 caractères', regex: /.{8,}/ },
  { id: 'upper', label: 'Une majuscule', regex: /[A-Z]/ },
  { id: 'lower', label: 'Une minuscule', regex: /[a-z]/ },
  { id: 'number', label: 'Un chiffre', regex: /\d/ },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading, error } = useAuth();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password', '');

  const onSubmit = async (data: RegisterForm) => {
    await registerUser({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    });
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-card animate-slideUp">
          <div className="auth-header">
            <Link href="/" className="auth-logo">
              🎓 LexaFlow
            </Link>
            <h1>Créer un compte</h1>
            <p>Commencez votre apprentissage gratuitement</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  Prénom
                </label>
                <div className="input-with-icon">
                  <User className="input-icon" size={18} />
                  <input
                    id="firstName"
                    type="text"
                    className="form-input"
                    placeholder="Jean"
                    autoComplete="given-name"
                    {...register('firstName', {
                      required: 'Prénom requis',
                    })}
                  />
                </div>
                {errors.firstName && (
                  <p className="form-error">{errors.firstName.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="form-input"
                  placeholder="Dupont"
                  autoComplete="family-name"
                  {...register('lastName')}
                />
              </div>
            </div>

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
                  autoComplete="new-password"
                  {...register('password', {
                    required: 'Mot de passe requis',
                    minLength: {
                      value: 8,
                      message: 'Au moins 8 caractères',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Doit contenir majuscule, minuscule et chiffre',
                    },
                  })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password requirements */}
              <div className="password-requirements">
                {passwordRequirements.map((req) => (
                  <div
                    key={req.id}
                    className={`requirement ${req.regex.test(password) ? 'met' : ''}`}
                  >
                    <Check size={14} />
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Confirmation requise',
                  validate: (value) =>
                    value === password || 'Les mots de passe ne correspondent pas',
                })}
              />
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  {...register('consent', {
                    required: 'Vous devez accepter les conditions',
                  })}
                />
                <span>
                  J'accepte les{' '}
                  <Link href="/terms" target="_blank">conditions d'utilisation</Link>
                  {' '}et la{' '}
                  <Link href="/privacy" target="_blank">politique de confidentialité</Link>
                </span>
              </label>
              {errors.consent && (
                <p className="form-error">{errors.consent.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg full-width"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Création...
                </>
              ) : (
                'Créer mon compte'
              )}
            </button>

            <div className="divider">
              <span>ou</span>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-lg full-width google-btn"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuer avec Google
            </button>
          </form>

          <p className="auth-footer">
            Déjà un compte ?{' '}
            <Link href="/login">Se connecter</Link>
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
          max-width: 480px;
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

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
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
        }

        .password-requirements {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .requirement {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }

        .requirement.met {
          color: var(--success-600);
        }

        .checkbox-group {
          margin: 1rem 0;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .checkbox-label input {
          margin-top: 0.25rem;
        }

        .checkbox-label a {
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

        .alert-error {
          background: var(--error-100);
          color: var(--error-700);
          border: 1px solid var(--error-200);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-lg);
          margin-bottom: 1rem;
        }
      `}</style>
    </main>
  );
}
