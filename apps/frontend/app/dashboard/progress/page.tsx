'use client';

import { useQuery } from '@tanstack/react-query';
import { Flame, Trophy, Target, TrendingUp, Calendar } from 'lucide-react';
import { userApi, coursesApi } from '@/lib/api';

export default function DashboardProgressPage() {
    const { data: progress, isLoading: progressLoading } = useQuery({
        queryKey: ['user-progress'],
        queryFn: async () => {
            const response = await userApi.getProgress();
            return response.data;
        },
    });

    const { data: streak } = useQuery({
        queryKey: ['user-streak'],
        queryFn: async () => {
            const response = await userApi.getStreak();
            return response.data;
        },
    });

    const { data: recommendations } = useQuery({
        queryKey: ['course-recommendations'],
        queryFn: async () => {
            const response = await coursesApi.getRecommendations();
            return response.data;
        },
    });

    if (progressLoading) {
        return (
            <main className="dashboard-progress-page">
                <div className="container">
                    <div className="loading">Chargement...</div>
                </div>
                <style jsx>{`
                    .dashboard-progress-page { padding: 2rem 0; }
                    .loading { text-align: center; padding: 4rem; color: var(--muted-foreground); }
                `}</style>
            </main>
        );
    }

    return (
        <main className="dashboard-progress-page">
            <div className="container">
                <div className="page-header">
                    <h1>Ma Progression</h1>
                    <p>Vue d&apos;ensemble de votre progression</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <Flame size={32} className="icon fire" />
                        <div className="stat-value">{streak?.currentStreak || 0}</div>
                        <div className="stat-label">Jours de série</div>
                        <div className="stat-detail">Record : {streak?.longestStreak || 0}</div>
                    </div>
                    <div className="stat-card">
                        <Target size={32} className="icon blue" />
                        <div className="stat-value">{progress?.summary.totalExercises || 0}</div>
                        <div className="stat-label">Exercices complétés</div>
                        <div className="stat-detail">Moy : {Math.round(progress?.summary.averageScore || 0)}%</div>
                    </div>
                    <div className="stat-card">
                        <Trophy size={32} className="icon gold" />
                        <div className="stat-value">{progress?.summary.badgesEarned || 0}</div>
                        <div className="stat-label">Badges obtenus</div>
                    </div>
                    <div className="stat-card">
                        <TrendingUp size={32} className="icon green" />
                        <div className="stat-value">{progress?.summary.coursesInProgress || 0}</div>
                        <div className="stat-label">Cours en cours</div>
                        <div className="stat-detail">{progress?.summary.coursesCompleted || 0} terminés</div>
                    </div>
                </div>

                {recommendations?.weakAreas && recommendations.weakAreas.length > 0 && (
                    <section className="weak-areas-section">
                        <h2>Domaines à améliorer</h2>
                        <div className="weak-areas-grid">
                            {recommendations.weakAreas.map((area: any, index: number) => (
                                <div key={index} className="weak-area-card">
                                    <div className="area-header">
                                        <h3>{area.type}</h3>
                                        <span className="score">{Math.round(area.avgScore)}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${area.avgScore}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {streak?.activeDates && streak.activeDates.length > 0 && (
                    <section className="calendar-section">
                        <h2>Activité récente</h2>
                        <div className="calendar-grid">
                            {Array.from({ length: 30 }, (_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() - (29 - i));
                                const dateStr = date.toISOString().split('T')[0];
                                const isActive = streak.activeDates.includes(dateStr);
                                return (
                                    <div
                                        key={i}
                                        className={`calendar-day ${isActive ? 'active' : ''}`}
                                        title={dateStr}
                                    />
                                );
                            })}
                        </div>
                        <div className="calendar-legend">
                            <div className="legend-item">
                                <div className="legend-color inactive"></div>
                                <span>Pas d&apos;activité</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color active"></div>
                                <span>Actif</span>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            <style jsx>{`
                .dashboard-progress-page { padding: 2rem 0; }
                .page-header { margin-bottom: 2.5rem; }
                .page-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
                .page-header p { color: var(--muted-foreground); }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
                .stat-card { background: var(--card); padding: 1.5rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); text-align: center; }
                .icon { margin-bottom: 1rem; }
                .icon.fire { color: #f59e0b; }
                .icon.blue { color: #3b82f6; }
                .icon.gold { color: #eab308; }
                .icon.green { color: #22c55e; }
                .stat-value { font-size: 2.5rem; font-weight: 700; color: var(--foreground); margin-bottom: 0.5rem; }
                .stat-label { font-size: 0.875rem; color: var(--muted-foreground); margin-bottom: 0.25rem; }
                .stat-detail { font-size: 0.75rem; color: var(--muted-foreground); }
                section { margin-bottom: 3rem; }
                h2 { font-size: 1.5rem; margin-bottom: 1.5rem; }
                .weak-areas-grid { display: grid; gap: 1rem; }
                .weak-area-card { background: var(--card); padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
                .area-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .area-header h3 { font-size: 1rem; }
                .area-header .score { font-size: 1.5rem; font-weight: 700; color: var(--primary-600); }
                .progress-bar { height: 8px; background: var(--muted); border-radius: var(--radius-full); overflow: hidden; }
                .progress-fill { height: 100%; background: linear-gradient(90deg, #ef4444, #f59e0b); border-radius: var(--radius-full); }
                .calendar-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(20px, 1fr)); gap: 4px; margin-bottom: 1rem; }
                .calendar-day { aspect-ratio: 1; background: var(--muted); border-radius: 4px; }
                .calendar-day.active { background: var(--primary-600); }
                .calendar-legend { display: flex; gap: 1.5rem; justify-content: center; }
                .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
                .legend-color { width: 20px; height: 20px; border-radius: 4px; }
                .legend-color.inactive { background: var(--muted); }
                .legend-color.active { background: var(--primary-600); }
            `}</style>
        </main>
    );
}
