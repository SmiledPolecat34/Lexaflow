'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, Users, Star, CheckCircle } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useAuth';

const courses = [
    { id: 'grammar-basics', title: 'Les bases de la grammaire', description: 'Apprenez les fondamentaux', level: 'A1', levelColor: '#22c55e', duration: '4h', students: 2450, rating: 4.8, lessons: 12, image: '📚' },
    { id: 'verb-tenses', title: 'Les temps verbaux', description: 'Maîtrisez tous les temps', level: 'A2', levelColor: '#84cc16', duration: '6h', students: 1890, rating: 4.9, lessons: 18, image: '⏰' },
    { id: 'vocabulary', title: 'Vocabulaire du quotidien', description: 'Mots essentiels', level: 'A1', levelColor: '#22c55e', duration: '3h', students: 3200, rating: 4.7, lessons: 10, image: '🗣️' },
    { id: 'business', title: 'Anglais professionnel', description: 'Pour le monde du travail', level: 'B1', levelColor: '#eab308', duration: '8h', students: 1560, rating: 4.8, lessons: 24, image: '💼' },
    { id: 'advanced', title: 'Grammaire avancée', description: 'Structures complexes', level: 'B2', levelColor: '#f97316', duration: '10h', students: 980, rating: 4.9, lessons: 30, image: '🎓' },
];

export default function CoursesPage() {
    const { isLoading } = useRequireAuth();

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p>Chargement...</p>
                <style jsx>{`
                    .loading-screen {
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 1rem;
                    }
                    .spinner {
                        width: 2rem;
                        height: 2rem;
                        border: 3px solid var(--muted);
                        border-top-color: var(--primary-600);
                        border-radius: 50%;
                        animation: spin 0.6s linear infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <main id="main-content" className="courses-page">
            <div className="container">
                <Link href="/" className="back-link"><ArrowLeft size={20} />Retour</Link>
                <div className="page-header"><h1>Cours</h1><p>Parcours structurés pour progresser</p></div>
                <div className="courses-grid">
                    {courses.map((c) => (
                        <div key={c.id} className="course-card">
                            <div className="course-image"><span className="emoji">{c.image}</span><span className="level" style={{ background: c.levelColor }}>{c.level}</span></div>
                            <div className="course-content">
                                <h2>{c.title}</h2><p>{c.description}</p>
                                <div className="meta"><span><Clock size={14} />{c.duration}</span><span><Users size={14} />{c.students}</span><span className="star"><Star size={14} fill="currentColor" />{c.rating}</span></div>
                                <div className="lessons"><CheckCircle size={14} />{c.lessons} leçons</div>
                                <Link href={`/courses/${c.id}`} className="btn btn-start">Commencer<ArrowRight size={16} /></Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style jsx>{`
        .courses-page{min-height:100vh;padding:3rem 0;background:var(--background)}
        .back-link{display:inline-flex;align-items:center;gap:.5rem;color:var(--primary-600);margin-bottom:2rem;font-weight:500}
        .page-header{text-align:center;margin-bottom:2rem}
        .page-header h1{font-size:3rem;background:linear-gradient(135deg,var(--primary-600),var(--secondary-500));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.5rem}
        .page-header p{color:var(--muted-foreground);font-size:1.25rem}
        .courses-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem}
        .course-card{background:var(--card);border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-md);transition:transform .2s}
        .course-card:hover{transform:translateY(-4px)}
        .course-image{height:100px;background:linear-gradient(135deg,var(--primary-100),var(--secondary-100));display:flex;align-items:center;justify-content:center;position:relative}
        .emoji{font-size:2.5rem}
        .level{position:absolute;top:.75rem;right:.75rem;padding:.25rem .75rem;border-radius:var(--radius-full);color:white;font-weight:600;font-size:.75rem}
        .course-content{padding:1.5rem}
        .course-content h2{font-size:1.25rem;margin-bottom:.5rem}
        .course-content p{color:var(--muted-foreground);margin-bottom:1rem}
        .meta{display:flex;gap:1rem;margin-bottom:1rem;font-size:.85rem;color:var(--muted-foreground)}
        .meta span{display:flex;align-items:center;gap:.25rem}
        .star{color:#f59e0b}
        .lessons{display:flex;align-items:center;gap:.5rem;color:var(--primary-600);margin-bottom:1.5rem}
        .btn-start{width:100%;display:flex;align-items:center;justify-content:center;gap:.5rem;padding:.75rem;background:var(--primary-600);color:white;border-radius:var(--radius-lg);font-weight:600}
        .btn-start:hover{background:var(--primary-700)}
      `}</style>
        </main>
    );
}
