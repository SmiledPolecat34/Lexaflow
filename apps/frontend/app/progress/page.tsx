'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Target,
    Award,
    Flame,
    BookOpen,
    CheckCircle
} from 'lucide-react';
import { userApi } from '@/lib/api';

export default function ProgressPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [progressData, setProgressData] = useState({
        streak: 0,
        exercisesCompleted: 0,
        coursesInProgress: 0,
        badgesEarned: 0,
        level: 'A2',
        levelProgress: 65,
        weeklyActivity: [30, 45, 60, 75, 90, 0, 0], // placeholder for now
    });

    useEffect(() => {
        async function fetchData() {
            try {
                // Check if user is authenticated
                const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
                setIsAuthenticated(!!token);

                if (token) {
                    // Fetch user progress
                    const [progressRes, streakRes] = await Promise.all([
                        userApi.getProgress(),
                        userApi.getStreak(),
                    ]);

                    if (progressRes.data && streakRes.data) {
                        setProgressData({
                            streak: streakRes.data.currentStreak,
                            exercisesCompleted: progressRes.data.summary.totalExercises,
                            coursesInProgress: progressRes.data.summary.coursesInProgress,
                            badgesEarned: progressRes.data.summary.badgesEarned,
                            level: 'A2', // TODO: Get from user profile
                            levelProgress: 65, // TODO: Calculate from progress
                            weeklyActivity: [30, 45, 60, 75, 90, 0, 0], // TODO: Get real weekly data
                        });
                    } else {
                        setError(progressRes.error || streakRes.error || 'Failed to load progress data');
                    }
                }
            } catch (err) {
                console.error('Error fetching progress:', err);
                setError('Failed to load progress data');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <main id="main-content" className="progress-page">
                <div className="container">
                    <div className="loading-state">Loading your progress...</div>
                </div>
                <style jsx>{`
                    .progress-page{min-height:100vh;padding:3rem 0;background:linear-gradient(135deg,var(--primary-50) 0%,var(--background) 50%)}
                    .loading-state{text-align:center;padding:4rem;color:var(--muted-foreground);font-size:1.125rem}
                `}</style>
            </main>
        );
    }

    if (error) {
        return (
            <main id="main-content" className="progress-page">
                <div className="container">
                    <Link href="/" className="back-link"><ArrowLeft size={20} />Retour</Link>
                    <div className="error-state">
                        <p>{error}</p>
                        <Link href="/login" className="btn btn-primary">Se connecter</Link>
                    </div>
                </div>
                <style jsx>{`
                    .progress-page{min-height:100vh;padding:3rem 0;background:linear-gradient(135deg,var(--primary-50) 0%,var(--background) 50%)}
                    .back-link{display:inline-flex;align-items:center;gap:.5rem;color:var(--primary-600);margin-bottom:2rem;font-weight:500}
                    .error-state{text-align:center;padding:4rem;color:var(--muted-foreground)}
                `}</style>
            </main>
        );
    }

    return (
        <main id="main-content" className="progress-page">
            <div className="container">
                <Link href="/" className="back-link"><ArrowLeft size={20} />Retour</Link>
                <div className="page-header"><h1>Ma Progression</h1><p>Suivez vos progrès et atteignez vos objectifs</p></div>

                <div className="stats-grid">
                    <div className="stat-card"><div className="stat-icon fire"><Flame size={24} /></div><div className="stat-value">{progressData.streak}</div><div className="stat-label">Jours de série</div></div>
                    <div className="stat-card"><div className="stat-icon green"><CheckCircle size={24} /></div><div className="stat-value">{progressData.exercisesCompleted}</div><div className="stat-label">Exercices complétés</div></div>
                    <div className="stat-card"><div className="stat-icon blue"><BookOpen size={24} /></div><div className="stat-value">{progressData.coursesInProgress}</div><div className="stat-label">Cours en cours</div></div>
                    <div className="stat-card"><div className="stat-icon purple"><Award size={24} /></div><div className="stat-value">{progressData.badgesEarned}</div><div className="stat-label">Badges obtenus</div></div>
                </div>

                <div className="level-section">
                    <h2>Niveau actuel</h2>
                    <div className="level-card">
                        <div className="level-badge">{progressData.level}</div>
                        <div className="level-info"><h3>Élémentaire</h3><p>Continue à progresser vers B1 !</p></div>
                        <div className="level-progress"><div className="progress-bar"><div className="progress-fill" style={{ width: `${progressData.levelProgress}%` }}></div></div><span>{progressData.levelProgress}% vers B1</span></div>
                    </div>
                </div>

                <div className="activity-section">
                    <h2>Activité cette semaine</h2>
                    <div className="week-grid">
                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (<div key={i} className={`day ${progressData.weeklyActivity[i] > 0 ? 'active' : ''}`}><span className="day-label">{d}</span><div className="day-bar" style={{ height: `${progressData.weeklyActivity[i]}%` }}></div></div>))}
                    </div>
                </div>

                {!isAuthenticated && (
                    <div className="cta-card">
                        <Target size={32} />
                        <h3>Fixez-vous un objectif</h3>
                        <p>Définissez un objectif quotidien pour rester motivé</p>
                        <Link href="/register" className="btn btn-primary">Créer un compte</Link>
                    </div>
                )}
            </div>
            <style jsx>{`
        .progress-page{min-height:100vh;padding:3rem 0;background:linear-gradient(135deg,var(--primary-50) 0%,var(--background) 50%)}
        .back-link{display:inline-flex;align-items:center;gap:.5rem;color:var(--primary-600);margin-bottom:2rem;font-weight:500}
        .page-header{text-align:center;margin-bottom:2.5rem}
        .page-header h1{font-size:2.5rem;background:linear-gradient(135deg,var(--primary-600),var(--secondary-500));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .page-header p{color:var(--muted-foreground);font-size:1.125rem}
        .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem;margin-bottom:2.5rem}
        .stat-card{background:var(--card);padding:1.5rem;border-radius:var(--radius-xl);text-align:center;box-shadow:var(--shadow-md)}
        .stat-icon{width:3rem;height:3rem;margin:0 auto 1rem;border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center}
        .stat-icon.fire{background:#fef3c7;color:#f59e0b}
        .stat-icon.green{background:#dcfce7;color:#22c55e}
        .stat-icon.blue{background:#dbeafe;color:#3b82f6}
        .stat-icon.purple{background:#f3e8ff;color:#8b5cf6}
        .stat-value{font-size:2rem;font-weight:700;color:var(--foreground)}
        .stat-label{font-size:.875rem;color:var(--muted-foreground)}
        .level-section,.activity-section{margin-bottom:2.5rem}
        h2{font-size:1.5rem;margin-bottom:1rem}
        .level-card{background:var(--card);padding:2rem;border-radius:var(--radius-xl);display:flex;align-items:center;gap:2rem;flex-wrap:wrap;box-shadow:var(--shadow-md)}
        .level-badge{width:4rem;height:4rem;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#84cc16,#22c55e);color:white;font-size:1.5rem;font-weight:700;border-radius:var(--radius-xl)}
        .level-info h3{margin-bottom:.25rem}
        .level-info p{color:var(--muted-foreground)}
        .level-progress{flex:1;min-width:200px}
        .progress-bar{height:8px;background:var(--muted);border-radius:var(--radius-full);overflow:hidden;margin-bottom:.5rem}
        .progress-fill{height:100%;background:linear-gradient(90deg,#84cc16,#22c55e);border-radius:var(--radius-full);transition:width 0.3s ease}
        .level-progress span{font-size:.875rem;color:var(--muted-foreground)}
        .week-grid{display:flex;gap:1rem;background:var(--card);padding:2rem;border-radius:var(--radius-xl);justify-content:space-around;box-shadow:var(--shadow-md)}
        .day{display:flex;flex-direction:column;align-items:center;gap:.5rem;width:3rem}
        .day-label{font-size:.875rem;color:var(--muted-foreground)}
        .day-bar{width:100%;background:var(--primary-200);border-radius:var(--radius-sm);min-height:4px;transition:height 0.3s ease}
        .day.active .day-bar{background:var(--primary-600)}
        .cta-card{text-align:center;padding:3rem;background:var(--card);border-radius:var(--radius-xl);box-shadow:var(--shadow-md)}
        .cta-card svg{color:var(--primary-600);margin-bottom:1rem}
        .cta-card h3{margin-bottom:.5rem}
        .cta-card p{color:var(--muted-foreground);margin-bottom:1.5rem}
      `}</style>
        </main>
    );
}
