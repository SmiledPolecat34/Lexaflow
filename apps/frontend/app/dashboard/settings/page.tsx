'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { User, Shield, Bell, Trash2, Download, Save } from 'lucide-react';
import { authApi, userApi } from '@/lib/api';
import TwoFactorModal from '@/components/TwoFactorModal';
import Toast, { ToastType } from '@/components/Toast';

export default function DashboardSettingsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState({
        level: 'A2',
        preferredStyle: 'ADAPTIVE',
        useFormal: false,
    });
    
    // 2FA Modal state
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [qrData, setQrData] = useState<{ qrCode: string; secret: string } | null>(null);
    
    // Toast state
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const { data: user } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const response = await authApi.getMe();
            return response.data;
        },
    });

    const handleSavePreferences = async () => {
        try {
            setSaving(true);
            const response = await userApi.updatePreferences(preferences);
            if (response.error) {
                if (response.error === 'Session expired') {
                    setToast({ message: 'Votre session a expiré. Redirection...', type: 'error' });
                    setTimeout(() => router.push('/login'), 2000);
                    return;
                }
                setToast({ message: response.error, type: 'error' });
                return;
            }
            setToast({ message: 'Préférences enregistrées avec succès !', type: 'success' });
        } catch (error) {
            console.error('Failed to save preferences:', error);
            setToast({ message: 'Erreur lors de l\'enregistrement', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleExportData = async () => {
        try {
            // Get the access token
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setToast({ message: 'Vous devez être connecté', type: 'error' });
                return;
            }

            // Fetch the export directly as a blob
            const response = await fetch('http://localhost:3001/api/users/export', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            // Get the blob data
            const blob = await response.blob();
            
            // Extract filename from Content-Disposition header or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `lexaflow-export-${new Date().toISOString()}.json`;
            if (contentDisposition) {
                const matches = /filename="([^"]+)"/.exec(contentDisposition);
                if (matches && matches[1]) {
                    filename = matches[1];
                }
            }

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
            
            setToast({ message: 'Données exportées avec succès !', type: 'success' });
        } catch (error) {
            console.error('Failed to export data:', error);
            setToast({ message: 'Erreur lors de l\'export des données', type: 'error' });
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = confirm(
            'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'
        );
        if (!confirmed) return;

        const password = prompt('Entrez votre mot de passe pour confirmer :');
        if (!password) return;

        try {
            const response = await userApi.deleteAccount(password, 'DELETE MY ACCOUNT');
            if (response.error) {
                if (response.error === 'Session expired') {
                    setToast({ message: 'Votre session a expiré. Redirection...', type: 'error' });
                    setTimeout(() => router.push('/login'), 2000);
                    return;
                }
                setToast({ message: response.error, type: 'error' });
                return;
            }
            
            // Clear tokens on successful deletion
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            
            setToast({ message: 'Compte supprimé avec succès. Redirection...', type: 'success' });
            setTimeout(() => router.push('/'), 2000);
        } catch (error) {
            console.error('Failed to delete account:', error);
            setToast({ message: 'Erreur lors de la suppression du compte', type: 'error' });
        }
    };

    const handle2FAToggle = async () => {
        if (user?.twoFactorEnabled) {
            // Disable 2FA
            const totpCode = prompt('Entrez votre code 2FA pour désactiver :');
            if (!totpCode) return;

            try {
                const response = await authApi.disable2FA(totpCode);
                if (response.error) {
                    if (response.error === 'Session expired') {
                        setToast({ message: 'Session expirée. Redirection...', type: 'error' });
                        setTimeout(() => router.push('/login'), 2000);
                        return;
                    }
                    setToast({ message: response.error, type: 'error' });
                    return;
                }
                setToast({ message: '2FA désactivée avec succès', type: 'success' });
                // Refresh user data
                await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            } catch (error) {
                console.error('Failed to disable 2FA:', error);
                setToast({ message: 'Erreur lors de la désactivation de 2FA', type: 'error' });
            }
        } else {
            // Enable 2FA
            try {
                const setupResponse = await authApi.setup2FA();
                
                if (setupResponse.error) {
                    if (setupResponse.error === 'Session expired') {
                        setToast({ message: 'Session expirée. Redirection...', type: 'error' });
                        setTimeout(() => router.push('/login'), 2000);
                        return;
                    }
                    setToast({ message: setupResponse.error, type: 'error' });
                    return;
                }
                
                if (setupResponse.data) {
                    // Show modal with QR code
                    setQrData({
                        qrCode: setupResponse.data.qrCode,
                        secret: setupResponse.data.secret,
                    });
                    setShow2FAModal(true);
                }
            } catch (error) {
                console.error('Failed to setup 2FA:', error);
                setToast({ message: 'Erreur lors de la configuration de 2FA', type: 'error' });
            }
        }
    };

    const handleVerify2FA = async (totpCode: string) => {
        try {
            const verifyResponse = await authApi.verify2FA(totpCode);
            if (verifyResponse.error) {
                setToast({ message: verifyResponse.error, type: 'error' });
                return;
            }
            if (verifyResponse.data) {
                const codes = verifyResponse.data.recoveryCodes || [];
                setShow2FAModal(false);
                setToast({ 
                    message: `2FA activée ! ${codes.length} codes de récupération générés`, 
                    type: 'success' 
                });
                // Download recovery codes
                const codesText = `Codes de récupération 2FA\n\n${codes.join('\n')}\n\nSauvegardez ces codes en lieu sûr !`;
                const blob = new Blob([codesText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'lexaflow-recovery-codes.txt';
                link.click();
                URL.revokeObjectURL(url);
                // Refresh user data instead of reloading the page
                await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            }
        } catch (error) {
            console.error('Failed to verify 2FA:', error);
            setToast({ message: 'Erreur lors de la vérification', type: 'error' });
        }
    };

    return (
        <main className="dashboard-settings-page">
            <div className="container">
                <div className="page-header">
                    <h1>Paramètres</h1>
                    <p>Gérez votre compte et vos préférences</p>
                </div>

                <div className="settings-sections">
                    <section className="settings-section">
                        <div className="section-header">
                            <User size={24} />
                            <h2>Profil</h2>
                        </div>
                        <div className="setting-item">
                            <label>Email</label>
                            <input type="email" value={user?.email || ''} disabled className="input" />
                        </div>
                        <div className="setting-item">
                            <label>Prénom</label>
                            <input type="text" value={user?.firstName || ''} disabled className="input" />
                        </div>
                        <div className="setting-item">
                            <label>Nom</label>
                            <input type="text" value={user?.lastName || ''} disabled className="input" />
                        </div>
                    </section>

                    <section className="settings-section">
                        <div className="section-header">
                            <Bell size={24} />
                            <h2>Préférences d&apos;apprentissage</h2>
                        </div>
                        <div className="setting-item">
                            <label>Niveau</label>
                            <select
                                value={preferences.level}
                                onChange={(e) => setPreferences({ ...preferences, level: e.target.value })}
                                className="input"
                            >
                                <option value="A1">A1 - Débutant</option>
                                <option value="A2">A2 - Élémentaire</option>
                                <option value="B1">B1 - Intermédiaire</option>
                                <option value="B2">B2 - Intermédiaire supérieur</option>
                                <option value="C1">C1 - Avancé</option>
                                <option value="C2">C2 - Maîtrise</option>
                            </select>
                        </div>
                        <div className="setting-item">
                            <label>Style d&apos;apprentissage</label>
                            <select
                                value={preferences.preferredStyle}
                                onChange={(e) => setPreferences({ ...preferences, preferredStyle: e.target.value })}
                                className="input"
                            >
                                <option value="SHORT">Court</option>
                                <option value="DETAILED">Détaillé</option>
                                <option value="ADAPTIVE">Adaptatif</option>
                            </select>
                        </div>
                        <div className="setting-item checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={preferences.useFormal}
                                    onChange={(e) => setPreferences({ ...preferences, useFormal: e.target.checked })}
                                />
                                Utiliser le langage formel
                            </label>
                        </div>
                        <button onClick={handleSavePreferences} disabled={saving} className="btn btn-primary">
                            <Save size={18} />
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </section>

                    <section className="settings-section">
                        <div className="section-header">
                            <Shield size={24} />
                            <h2>Sécurité</h2>
                        </div>
                        <div className="setting-item">
                            <label>Authentification à deux facteurs</label>
                            <p className="setting-description">
                                {user?.twoFactorEnabled
                                    ? 'Activée - Votre compte est sécurisé'
                                    : 'Désactivée - Protégez votre compte'}
                            </p>
                            <button onClick={handle2FAToggle} className="btn btn-secondary">
                                {user?.twoFactorEnabled ? 'Désactiver 2FA' : 'Activer 2FA'}
                            </button>
                        </div>
                    </section>

                    <section className="settings-section danger-zone">
                        <div className="section-header">
                            <Trash2 size={24} />
                            <h2>Zone de danger</h2>
                        </div>
                        <div className="setting-item">
                            <label>Exporter vos données</label>
                            <p className="setting-description">
                                Téléchargez toutes vos données personnelles
                            </p>
                            <button onClick={handleExportData} className="btn btn-secondary">
                                <Download size={18} />
                                Exporter
                            </button>
                        </div>
                        <div className="setting-item">
                            <label>Supprimer le compte</label>
                            <p className="setting-description">
                                Supprime définitivement votre compte et toutes vos données
                            </p>
                            <button onClick={handleDeleteAccount} className="btn btn-danger">
                                <Trash2 size={18} />
                                Supprimer mon compte
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            <style jsx>{`
                .dashboard-settings-page { padding: 2rem 0; }
                .page-header { margin-bottom: 2.5rem; }
                .page-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
                .page-header p { color: var(--muted-foreground); }
                .settings-sections { max-width: 800px; }
                .settings-section { background: var(--card); padding: 2rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); margin-bottom: 2rem; }
                .settings-section.danger-zone { border: 2px solid #ef4444; }
                .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; color: var(--primary-600); }
                .section-header h2 { font-size: 1.25rem; margin: 0; }
                .setting-item { margin-bottom: 1.5rem; }
                .setting-item:last-child { margin-bottom: 0; }
                .setting-item label { display: block; font-weight: 600; margin-bottom: 0.5rem; }
                .setting-item.checkbox label { display: flex; align-items: center; gap: 0.5rem; }
                .setting-description { font-size: 0.875rem; color: var(--muted-foreground); margin-bottom: 0.75rem; }
                .input { width: 100%; padding: 0.75rem; border: 2px solid var(--border); border-radius: var(--radius-lg); font-size: 1rem; background: var(--background); }
                .input:focus { outline: none; border-color: var(--primary-600); }
                .input:disabled { opacity: 0.6; cursor: not-allowed; }
                .btn { padding: 0.75rem 1.5rem; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 0.5rem; }
                .btn-primary { background: var(--primary-600); color: white; }
                .btn-secondary { background: var(--muted); color: var(--foreground); }
                .btn-danger { background: #ef4444; color: white; }
                .btn:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>

            {/* 2FA Modal */}
            {show2FAModal && qrData && (
                <TwoFactorModal
                    isOpen={show2FAModal}
                    onClose={() => setShow2FAModal(false)}
                    qrCode={qrData.qrCode}
                    secret={qrData.secret}
                    onVerify={handleVerify2FA}
                />
            )}

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </main>
    );
}
