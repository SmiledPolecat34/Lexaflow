'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Headphones, Play, Lock } from 'lucide-react';
import { exercisesApi } from '@/lib/api';

interface Theme {
    id: string;
    name: string;
    icon: string;
}

export default function ListeningExercisesPage() {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState('B1');

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

    const levels = ['A2', 'B1', 'B2', 'C1', 'C2'];

    return (
        <main id="main-content" className="listening-exercises-page">
            <div className="container">
                <Link href="/exercises" className="back-link">
                    <ArrowLeft size={20} />
                    Retour aux exercices
                </Link>

                <div className="page-header">
                    <Headphones size={48} className="page-icon" />
                    <h1>Compréhension Orale</h1>
                    <p>Améliorez votre écoute avec des audios natifs</p>
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

                {loading ? (
                    <div className="loading">Chargement des thèmes...</div>
                ) : (
                    <div className="themes-grid">
                        {themes.slice(0, 6).map((theme) => (
                            <Link
                                key={theme.id}
                                href={`/exercises/listening/${theme.id}?level=${selectedLevel}`}
                                className="theme-card"
                            >
                                <div className="theme-icon">{theme.icon || '🎧'}</div>
                                <h3>{theme.name}</h3>
                                <div className="theme-meta">
                                    <span className="exercise-count">8 exercices</span>
                                    <Play size={16} />
                                </div>
                            </Link>
                        ))}

                        <div className="theme-card locked">
                            <div className="locked-badge">
                                <Lock size={14} />
                                Premium
                            </div>
                            <div className="theme-icon">🎬</div>
                            <h3>Extraits de films</h3>
                            <div className="theme-meta">
                                <span className="exercise-count">20 exercices</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .listening-exercises-page {
                    min-height: 100vh;
                    padding: 3rem 0;
                    background: linear-gradient(135deg, #fef3c7 0%, var(--background) 50%);
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
                    color: #f59e0b;
                    margin-bottom: 1rem;
                }

                .page-header h1 {
                    font-size: 2.5rem;
                    background: linear-gradient(135deg, #f59e0b, #d97706);
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
                    border-color: #f59e0b;
                    color: #f59e0b;
                }

                .level-btn.active {
                    border-color: #f59e0b;
                    background: #f59e0b;
                    color: white;
                }

                .loading {
                    text-align: center;
                    padding: 4rem;
                    color: var(--muted-foreground);
                }

                .themes-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .theme-card {
                    background: var(--card);
                    border-radius: var(--radius-xl);
                    padding: 2rem;
                    box-shadow: var(--shadow-md);
                    transition: transform 0.2s, box-shadow 0.2s;
                    position: relative;
                    cursor: pointer;
                }

                .theme-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                }

                .theme-card.locked {
                    opacity: 0.7;
                    cursor: default;
                }

                .locked-badge {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.25rem 0.75rem;
                    background: var(--gray-800);
                    color: white;
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .theme-icon {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                }

                .theme-card h3 {
                    font-size: 1.125rem;
                    margin-bottom: 1rem;
                    color: var(--foreground);
                }

                .theme-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #f59e0b;
                    font-size: 0.875rem;
                    font-weight: 600;
                }

                @media (max-width: 768px) {
                    .page-header h1 {
                        font-size: 2rem;
                    }

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
