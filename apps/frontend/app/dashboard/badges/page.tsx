'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Trophy, Lock, Star } from 'lucide-react';
import { userApi } from '@/lib/api';

export default function DashboardBadgesPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['user-badges'],
        queryFn: async () => {
            const response = await userApi.getBadges();
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <main className="dashboard-badges-page">
                <div className="container">
                    <div className="loading">Chargement des badges...</div>
                </div>
                <style jsx>{`
                    .dashboard-badges-page { padding: 2rem 0; }
                    .loading { text-align: center; padding: 4rem; color: var(--muted-foreground); }
                `}</style>
            </main>
        );
    }

    const earned = data?.earned ||[];
    const available = data?.available || [];

    return (
        <main className="dashboard-badges-page">
            <div className="container">
                <div className="page-header">
                    <h1>Mes Badges</h1>
                    <p>Débloquez des badges en progressant dans votre apprentissage</p>
                    <div className="stats">
                        <div className="stat">
                            <span className="value">{earned.length}</span>
                            <span className="label">Badges obtenus</span>
                        </div>
                        <div className="stat">
                            <span className="value">{available.length}</span>
                            <span className="label">À débloquer</span>
                        </div>
                    </div>
                </div>

                {earned.length > 0 && (
                    <section className="badges-section">
                        <h2>Badges obtenus</h2>
                        <div className="badges-grid">
                            {earned.map((badge: any) => (
                                <div key={badge.id} className={`badge-card earned rarity-${badge.rarity.toLowerCase()}`}>
                                    <Trophy size={48} className="badge-icon" />
                                    <h3>{badge.name}</h3>
                                    <p>{badge.description}</p>
                                    <div className="badge-meta">
                                        <span className="rarity">{badge.rarity}</span>
                                        <span className="points">+{badge.points} points</span>
                                    </div>
                                    <span className="earned-date">
                                        Obtenu le {new Date(badge.earnedAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {available.length > 0 && (
                    <section className="badges-section">
                        <h2>Badges à débloquer</h2>
                        <div className="badges-grid">
                            {available.map((badge: any) => (
                                <div key={badge.id} className="badge-card locked">
                                    <Lock size={48} className="badge-icon" />
                                    <h3>{badge.name}</h3>
                                    <p>{badge.description}</p>
                                    <div className="badge-meta">
                                        <span className="rarity">{badge.rarity}</span>
                                        <span className="points">+{badge.points} points</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <style jsx>{`
                .dashboard-badges-page { padding: 2rem 0; }
                .page-header { margin-bottom: 2.5rem; text-align: center; }
                .page-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
                .page-header p { color: var(--muted-foreground); margin-bottom: 2rem; }
                .stats { display: flex; gap: 2rem; justify-content: center; }
                .stat { text-align: center; }
                .stat .value { display: block; font-size: 2rem; font-weight: 700; color: var(--primary-600); }
                .stat .label { font-size: 0.875rem; color: var(--muted-foreground); }
                .badges-section { margin-bottom: 3rem; }
                h2 { font-size: 1.5rem; margin-bottom: 1.5rem; }
                .badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
                .badge-card { background: var(--card); padding: 2rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); text-align: center; transition: all 0.2s; }
                .badge-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
                .badge-card.locked { opacity: 0.6; }
                .badge-card.earned { border: 2px solid var(--primary-600); }
                .badge-card.rarity-legendary { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
                .badge-card.rarity-epic { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
                .badge-card.rarity-rare { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
                .badge-icon { margin-bottom: 1rem; color: currentColor; }
                .badge-card h3 { font-size: 1.125rem; margin-bottom: 0.5rem; }
                .badge-card p { font-size: 0.875rem; opacity: 0.9; margin-bottom: 1rem; }
                .badge-meta { display: flex; gap: 0.75rem; justify-content: center; margin-bottom: 0.5rem; }
                .rarity, .points { padding: 0.25rem 0.75rem; background: rgba(255,255,255,0.2); border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; }
                .badge-card:not(.earned) .rarity, .badge-card:not(.earned) .points { background: var(--muted); color: var(--foreground); }
                .earned-date { font-size: 0.75rem; color: var(--muted-foreground); }
            `}</style>
        </main>
    );
}
