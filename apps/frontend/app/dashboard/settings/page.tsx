'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { User, Shield, Bell, Trash2, Download, Save } from 'lucide-react';
import { authApi, userApi } from '@/lib/api';

export default function DashboardSettingsPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState({
        level: 'A2',
        preferredStyle: 'neutral',
        useFormal: false,
    });

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
            await userApi.updatePreferences(preferences);
            alert('Préférences enregistrées');
        } catch (error) {
            console.error('Failed to save preferences:', error);
            alert('Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    const handleExportData = async () => {
        try {
            const response = await userApi.exportData();
            if (response.data) {
                // Create a blob and download it
                const dataStr = JSON.stringify(response.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `lexaflow-export-${new Date().toISOString()}.json`;
                link.click();
                URL.revokeObjectURL(url);
                alert('Export des données réussi');
            } else {
                throw new Error(response.error || 'Failed to export');
            }
        } catch (error) {
            console.error('Failed to export data:', error);
            alert('Erreur lors de l\'export des données');
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
            await userApi.deleteAccount(password, 'DELETE MY ACCOUNT');
            router.push('/');
        } catch (error) {
            console.error('Failed to delete account:', error);
            alert('Erreur lors de la suppression du compte');
        }
    };

    const handle2FAToggle = async () => {
        if (user?.twoFactorEnabled) {
            // Disable 2FA
            const totpCode = prompt('Entrez votre code 2FA pour désactiver :');
            if (!totpCode) return;

            try {
                await authApi.disable2FA(totpCode);
                alert('2FA désactivée');
                window.location.reload();
            } catch (error) {
                console.error('Failed to disable 2FA:', error);
                alert('Erreur lors de la désactivation de 2FA');
            }
        } else {
            // Enable 2FA
            try {
                const setupResponse = await authApi.setup2FA();
                if (setupResponse.data) {
                    // Show QR code
                    const qrCode = setupResponse.data.qrCode;
                    const secret = setupResponse.data.secret;
                    
                    // Create modal to show QR code
                    const showQRCode = confirm(
                        `Pour activer la 2FA, scannez le QR code avec votre application d'authentification (Google Authenticator, Authy, etc.).\n\nSecret manuel : ${secret}\n\nCliquez OK pour continuer et entrer votre code.`
                    );
                    
                    if (showQRCode) {
                        // For now, open QR code in new window
                        const qrWindow = window.open('', 'QR Code', 'width=400,height=500');
                        if (qrWindow) {
                            qrWindow.document.write(`
                                <html>
                                    <head><title>QR Code 2FA</title></head>
                                    <body style="text-align: center; padding: 20px; font-family: sans-serif;">
                                        <h2>Scannez ce QR Code</h2>
                                        <img src="${qrCode}" alt="QR Code" style="max-width:300px" />
                                        <p>Secret manuel: <code>${secret}</code></p>
                                        <p>Fermez cette fenêtre et entrez votre code 2FA</p>
                                    </body>
                                </html>
                            `);
                        }
                        
                        const totpCode = prompt('Entrez le code 2FA de votre application :');
                        if (totpCode) {
                            const verifyResponse = await authApi.verify2FA(totpCode);
                            if (verifyResponse.data) {
                                alert(`2FA activée ! Codes de récupération : ${JSON.stringify(verifyResponse.data)}\n\nSauvegardez ces codes en lieu sûr !`);
                                window.location.reload();
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to setup 2FA:', error);
                alert('Erreur lors de la configuration de 2FA');
            }
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
                                <option value="neutral">Neutre</option>
                                <option value="casual">Décontracté</option>
                                <option value="formal">Formel</option>
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
        </main>
    );
}
