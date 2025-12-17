'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/hooks/useAuth';
import GDPRConsentModal from '@/components/GDPRConsentModal';

export default function GDPRConsentProvider({ children }: { children: React.ReactNode }) {
    const [needsConsent, setNeedsConsent] = useState(false);
    const [checking, setChecking] = useState(true);
    const { isAuthenticated } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();

    // Pages that don't require authentication
    const publicPages = ['/login', '/register', '/privacy', '/terms', '/gdpr', '/contact', '/help'];
    const isPublicPage = publicPages.some(page => pathname.startsWith(page));

    useEffect(() => {
        async function checkConsentStatus() {
            if (!isAuthenticated || isPublicPage) {
                setChecking(false);
                return;
            }

            try {
                const response = await authApi.getMe();
                if (response.data) {
                    if (!response.data.consentGiven) {
                        setNeedsConsent(true);
                    }
                }
            } catch (error) {
                console.error('Failed to check consent status:', error);
            } finally {
                setChecking(false);
            }
        }

        checkConsentStatus();
    }, [isAuthenticated, isPublicPage]);

    const handleConsent = () => {
        setNeedsConsent(false);
        // Refresh the page to re-fetch user data
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/exercises')) {
            router.refresh();
        }
    };

    if (checking) {
        return <>{children}</>;
    }

    return (
        <>
            {children}
            {needsConsent && <GDPRConsentModal onConsent={handleConsent} />}
        </>
    );
}
