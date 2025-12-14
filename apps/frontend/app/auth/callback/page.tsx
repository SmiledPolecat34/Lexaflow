'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setTokens } from '@/lib/api';
import { useAuthStore } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser } = useAuthStore();
    const [error, setError] = useState<string | null>(null);

    const fetchUserAndRedirect = useCallback(
        async (accessToken: string) => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/me`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );

                if (response.ok) {
                    const user = await response.json();
                    setUser(user);
                    router.push('/dashboard');
                } else {
                    setError('Erreur lors de la récupération du profil');
                    setTimeout(() => router.push('/login'), 3000);
                }
            } catch {
                setError('Erreur de connexion');
                setTimeout(() => router.push('/login'), 3000);
            }
        },
        [router, setUser]
    );


    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setError(getErrorMessage(errorParam));
            setTimeout(() => router.push('/login'), 3000);
            return;
        }

        if (accessToken && refreshToken) {
            setTokens(accessToken, refreshToken);
            void fetchUserAndRedirect(accessToken);
        } else {
            setError('Tokens manquants');
            setTimeout(() => router.push('/login'), 3000);
        }
    }, [searchParams, router, fetchUserAndRedirect]);

    const getErrorMessage = (error: string): string => {
        const messages: Record<string, string> = {
            invalid_state: 'Session expirée. Veuillez réessayer.',
            no_code: 'Autorisation refusée.',
            token_exchange_failed: 'Erreur d\'authentification Google.',
            user_info_failed: 'Impossible de récupérer vos informations.',
            account_disabled: 'Votre compte a été désactivé.',
            oauth_failed: 'Erreur lors de la connexion avec Google.',
            oauth_not_configured: 'Google OAuth n\'est pas configuré.',
        };
        return messages[error] || 'Une erreur est survenue.';
    };

    return (
        <main className="callback-page">
            <div className="callback-card">
                {error ? (
                    <>
                        <div className="error-icon">❌</div>
                        <h1>Erreur de connexion</h1>
                        <p>{error}</p>
                        <p className="redirect-text">Redirection vers la page de connexion...</p>
                    </>
                ) : (
                    <>
                        <Loader2 className="spinner" size={48} />
                        <h1>Connexion en cours...</h1>
                        <p>Veuillez patienter pendant que nous finalisons votre connexion.</p>
                    </>
                )}
            </div>

            <style jsx>{`
        .callback-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-50), var(--secondary-50));
          padding: 2rem;
        }

        .callback-card {
          background: var(--card);
          padding: 3rem;
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-xl);
          text-align: center;
          max-width: 400px;
        }

        .callback-card h1 {
          margin: 1rem 0 0.5rem;
          font-size: 1.5rem;
        }

        .callback-card p {
          color: var(--muted-foreground);
        }

        .error-icon {
          font-size: 3rem;
        }

        .redirect-text {
          margin-top: 1rem;
          font-size: 0.875rem;
        }

        :global(.spinner) {
          color: var(--primary-600);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </main>
    );
}
