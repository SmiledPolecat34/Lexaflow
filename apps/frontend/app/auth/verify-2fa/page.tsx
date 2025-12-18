'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TwoFactorLoginModal from '@/components/TwoFactorLoginModal';
import { setTokens } from '@/lib/api';

function Verify2FAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/login?error=missing_token');
    }
  }, [token, router]);

  const handleVerify = async (code: string) => {
    if (!token) return;

    setIsVerifying(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/auth/oauth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, totpCode: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Code invalide');
        setIsVerifying(false);
        return;
      }

      // Success! Store tokens and redirect
      if (data.accessToken && data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError('Erreur lors de la vérification');
      setIsVerifying(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="verify-2fa-page">
      <TwoFactorLoginModal
        isOpen={true}
        onClose={() => router.push('/login')}
        onVerify={handleVerify}
        error={error}
      />

      <style jsx>{`
        .verify-2fa-page {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--primary-50), var(--secondary-50));
        }
      `}</style>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <Verify2FAContent />
    </Suspense>
  );
}
