'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, Play, Clock, Trophy } from 'lucide-react';
import { exercisesApi } from '@/lib/api';

interface Theme {
    id: string;
    name: string;
    icon: string;
}

export default function SpeedExercisesPage() {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState('A2');

    useEffect(() => {
        async function loadThemes() {
            try {
                const result = await exercisesApi.getThemes();
                if (result.data) {
                    setThemes(result.data);
                }
            } catch (error) {
                console.error('Failed to load themes:', error);
            } finally {
                setLoading(false);
            }
        }
        loadThemes();
    }, []);

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    const speedChallenges = [
        {
            id: 'quick-fire',
            title: 'Questions rapides',
            description: '10 questions en 2 minutes',
            time: '2 min',
            color: '#ef4444',
        },
        {
            id: 'lightning-round',
            title: 'Éclair',
            description: '20 questions en 5 minutes',
            time: '5 min',
            color: '#f59e0b',
        },
        {
            id: 'marathon',
            title: 'Marathon',
            description: '50 questions en 15 minutes',
            time: '15 min',
            color: '#8b5cf6',
        },
    ];

    return (
        <main id="main-content" className="speed-exercises-page">
            <div className="container">
                <Link href="/exercises" className="back-link">
                    <ArrowLeft size={20} />
                    Retour aux exercices
                </Link>

                <div className="page-header">
                    <Zap size={48} className="page-icon" />
                    <h1>Exercices Rapides</h1>
                    <p>Challenges chronométrés pour progresser vite</p>
                </div>

                <div className="level-selector">
                    <span className="selector-label">Votre niveau :</span>
                    <div className="level-buttons">
                        {levels.map((level) => (
                            <button
                                key={level}
                                className={`level-btn ${selectedLevel === level ? 'active' : ''}`}
                                onClick={() => setSelectedLevel(level)}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <section className="challenges-section">
                    <h2>Défis chronométrés</h2>
                    <div className="challenges-grid">
                        {speedChallenges.map((challenge) => (
                            <Link
                                key={challenge.id}
                                href={`/exercises/speed/${challenge.id}?level=${selectedLevel}`}
                                className="challenge-card"
                                style={{ '--challenge-color': challenge.color } as React.CSSProperties}
                            >
                                <div className="challenge-header">
                                    <Zap size={32} className="challenge-icon" />
                                    <div className="time-badge">
                                        <Clock size={14} />
                                        {challenge.time}
                                    </div>
                                </div>
                                <h3>{challenge.title}</h3>
                                <p>{challenge.description}</p>
                                <div className="challenge-action">
                                    <span>Commencer</span>
                                    <Play size={18} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {loading ? (
                    <div className="loading">Chargement des thèmes...</div>
                ) : (
                    <section className="themes-section">
                        <h2>Par thème</h2>
                        <div className="themes-grid">
                            {themes.slice(0, 6).map((theme) => (
                                <Link
                                    key={theme.id}
                                    href={`/exercises/speed/theme/${theme.id}?level=${selectedLevel}`}
                                    className="theme-card"
                                >
                                    <div className="theme-icon">{theme.icon || '⚡'}</div>
                                    <h3>{theme.name}</h3>
                                    <div className="theme-meta">
                                        <span className="exercise-count">10 questions</span>
                                        <Play size={16} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <div className="leaderboard-cta">
                    <Trophy size={32} />
                    <h3>Classement mondial</h3>
                    <p>Créez un compte pour figurer dans le classement</p>
                    <Link href="/register" className="btn btn-primary">S'inscrire</Link>
                </div>
            </div>

            <style jsx>{`
                .speed-exercises-page {
                    min-height: 100vh;
                    padding: 3rem 0;
                    background: linear-gradient(135deg, #fee2e2 0%, var(--background) 50%);
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--primary-600);
                    margin-bottom: 2rem;
                    font-weight: 500;
                    transition: gap 0.2s;
                }

                .back-link:hover {
                    gap: 0.75rem;
                }

                .page-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .page-icon {
                    color: #ef4444;
                    margin-bottom: 1rem;
                }

                .page-header h1 {
                    font-size: 2.5rem;
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 0.5rem;
                }

                .page-header p {
                    color: var(--muted-foreground);
                    font-size: 1.125rem;
                }

                .level-selector {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    margin-bottom: 3rem;
                    flex-wrap: wrap;
                }

                .selector-label {
                    color: var(--muted-foreground);
                    font-weight: 500;
                }

                .level-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .level-btn {
                    padding: 0.5rem 1rem;
                    border: 2px solid var(--border);
                    border-radius: var(--radius-full);
                    background: var(--card);
                    color: var(--foreground);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .level-btn:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                .level-btn.active {
                    border-color: #ef4444;
                    background: #ef4444;
                    color: white;
                }

                .challenges-section,
                .themes-section {
                    margin-bottom: 3rem;
                }

                h2 {
                    font-size: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .challenges-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .challenge-card {
                    background: var(--card);
                    border-radius: var(--radius-xl);
                    padding: 2rem;
                    box-shadow: var(--shadow-md);
                    transition: transform 0.2s, box-shadow 0.2s;
                    cursor: pointer;
                    border: 2px solid transparent;
                }

                .challenge-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                    border-color: var(--challenge-color);
                }

                .challenge-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .challenge-icon {
                    color: var(--challenge-color);
                }

                .time-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.25rem 0.75rem;
                    background: color-mix(in srgb, var(--challenge-color) 15%, transparent);
                    color: var(--challenge-color);
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .challenge-card h3 {
                    font-size: 1.25rem;
                    margin-bottom: 0.5rem;
                    color: var(--foreground);
                }

                .challenge-card p {
                    color: var(--muted-foreground);
                    margin-bottom: 1.5rem;
                }

                .challenge-action {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: var(--challenge-color);
                    font-weight: 600;
                }

                .loading {
                    text-align: center;
                    padding: 2rem;
                    color: var(--muted-foreground);
                }

                .themes-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 1rem;
                }

                .theme-card {
                    background: var(--card);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    box-shadow: var(--shadow-sm);
                    transition: transform 0.2s, box-shadow 0.2s;
                    cursor: pointer;
                }

                .theme-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .theme-icon {
                    font-size: 1.5rem;
                    margin-bottom: 0.75rem;
                }

                .theme-card h3 {
                    font-size: 1rem;
                    margin-bottom: 0.75rem;
                    color: var(--foreground);
                }

                .theme-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #ef4444;
                    font-size: 0.875rem;
                    font-weight: 600;
                }

                .leaderboard-cta {
                    text-align: center;
                    padding: 3rem;
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    border-radius: var(--radius-xl);
                    color: white;
                }

                .leaderboard-cta h3 {
                    color: white;
                    margin: 1rem 0 0.5rem;
                }

                .leaderboard-cta p {
                    opacity: 0.9;
                    margin-bottom: 1.5rem;
                }

                @media (max-width: 768px) {
                    .page-header h1 {
                        font-size: 2rem;
                    }

                    .challenges-grid,
                    .themes-grid {
                        grid-template-columns: 1fr;
                    }

                    .level-selector {
                        flex-direction: column;
                    }
                }
            `}</style>
        </main>
    );
}
