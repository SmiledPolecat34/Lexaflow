'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, PenTool, Headphones, MessageSquare, Zap, Lock, Star } from 'lucide-react';

const exerciseCategories = [
    {
        id: 'grammar',
        icon: <BookOpen size={24} />,
        title: 'Grammaire',
        description: 'Maîtrisez les règles grammaticales anglaises',
        exercises: 120,
        color: '#3b82f6',
        locked: false,
        levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    },
    {
        id: 'vocabulary',
        icon: <PenTool size={24} />,
        title: 'Vocabulaire',
        description: 'Enrichissez votre lexique au quotidien',
        exercises: 200,
        color: '#22c55e',
        locked: false,
        levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    },
    {
        id: 'listening',
        icon: <Headphones size={24} />,
        title: 'Compréhension orale',
        description: 'Améliorez votre écoute avec des audios natifs',
        exercises: 80,
        color: '#f59e0b',
        locked: false,
        levels: ['A2', 'B1', 'B2', 'C1', 'C2'],
    },
    {
        id: 'conversation',
        icon: <MessageSquare size={24} />,
        title: 'Expression orale',
        description: 'Pratiquez la conversation avec l\'IA',
        exercises: 50,
        color: '#8b5cf6',
        locked: true,
        levels: ['B1', 'B2', 'C1', 'C2'],
    },
    {
        id: 'speed',
        icon: <Zap size={24} />,
        title: 'Exercices rapides',
        description: 'Challenges chronométrés pour progresser vite',
        exercises: 100,
        color: '#ef4444',
        locked: false,
        levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    },
];

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function ExercisesPage() {
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

    // Filter categories based on selected level
    const filteredCategories = selectedLevel
        ? exerciseCategories.filter(cat => cat.levels.includes(selectedLevel))
        : exerciseCategories;

    return (
        <main id="main-content" className="exercises-page">
            <div className="container">
                <Link href="/" className="back-link">
                    <ArrowLeft size={20} />
                    Retour à l'accueil
                </Link>

                <div className="page-header">
                    <h1>Exercices</h1>
                    <p>Plus de 500 exercices pour améliorer votre anglais</p>
                </div>

                <div className="level-filter">
                    <span className="filter-label">Filtrer par niveau :</span>
                    <div className="level-buttons">
                        <button
                            className={`level-btn ${selectedLevel === null ? 'active' : ''}`}
                            onClick={() => setSelectedLevel(null)}
                        >
                            Tous
                        </button>
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

                <div className="categories-grid">
                    {filteredCategories.map((category) => (
                        <div
                            key={category.id}
                            className={`category-card ${category.locked ? 'locked' : ''}`}
                            style={{ '--category-color': category.color } as React.CSSProperties}
                        >
                            {category.locked && (
                                <div className="locked-badge">
                                    <Lock size={14} />
                                    Premium
                                </div>
                            )}
                            <div className="category-icon">{category.icon}</div>
                            <h2>{category.title}</h2>
                            <p>{category.description}</p>
                            <div className="category-meta">
                                <span className="exercise-count">{category.exercises} exercices</span>
                                <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < 3 ? 'currentColor' : 'none'} />
                                    ))}
                                </div>
                            </div>
                            <Link
                                href={category.locked ? '/register' : `/exercises/${category.id}`}
                                className="btn btn-category"
                            >
                                {category.locked ? 'Débloquer' : 'Commencer'}
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="cta-section">
                    <div className="cta-card">
                        <h2>Pas encore inscrit ?</h2>
                        <p>Créez un compte gratuit pour sauvegarder votre progression et accéder à tous les exercices.</p>
                        <Link href="/register" className="btn btn-primary">
                            Créer un compte gratuit
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .exercises-page {
          min-height: 100vh;
          padding: 3rem 0;
          background: linear-gradient(135deg, var(--primary-50) 0%, var(--background) 50%);
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
          margin-bottom: 2.5rem;
        }

        .page-header h1 {
          font-size: 3rem;
          background: linear-gradient(135deg, var(--primary-600), var(--secondary-500));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: var(--muted-foreground);
          font-size: 1.25rem;
        }

        .level-filter {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .filter-label {
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
          border-color: var(--primary-600);
          color: var(--primary-600);
        }

        .level-btn.active {
          border-color: var(--primary-600);
          background: var(--primary-600);
          color: white;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 4rem;
        }

        .category-card {
          background: var(--card);
          border-radius: var(--radius-xl);
          padding: 2rem;
          box-shadow: var(--shadow-md);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }

        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .category-card.locked {
          opacity: 0.85;
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

        .category-icon {
          width: 3.5rem;
          height: 3.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: color-mix(in srgb, var(--category-color) 15%, transparent);
          color: var(--category-color);
          border-radius: var(--radius-lg);
          margin-bottom: 1.5rem;
        }

        .category-card h2 {
          font-size: 1.25rem;
          color: var(--foreground);
          margin-bottom: 0.5rem;
        }

        .category-card p {
          color: var(--muted-foreground);
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .category-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .exercise-count {
          font-size: 0.875rem;
          color: var(--category-color);
          font-weight: 600;
        }

        .stars {
          display: flex;
          gap: 0.125rem;
          color: #f59e0b;
        }

        .btn-category {
          width: 100%;
          padding: 0.75rem;
          background: var(--category-color);
          color: white;
          border: none;
          border-radius: var(--radius-lg);
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          text-align: center;
        }

        .btn-category:hover {
          opacity: 0.9;
        }

        .cta-section {
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-card {
          text-align: center;
          padding: 3rem;
          background: linear-gradient(135deg, var(--primary-600), var(--secondary-600));
          border-radius: var(--radius-xl);
          color: white;
        }

        .cta-card h2 {
          color: white;
          margin-bottom: 0.75rem;
        }

        .cta-card p {
          opacity: 0.9;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 2rem;
          }

          .categories-grid {
            grid-template-columns: 1fr;
          }

          .level-filter {
            flex-direction: column;
          }
        }
      `}</style>
        </main>
    );
}
