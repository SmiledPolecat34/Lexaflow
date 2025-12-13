'use client';

import Link from 'next/link';
import { ArrowLeft, Clock, Users, Star, CheckCircle, PlayCircle, Lock } from 'lucide-react';

const lessons = [
    { id: 1, title: "Se présenter et saluer", duration: "20 min", locked: false },
    { id: 2, title: "Les nombres et l'heure", duration: "25 min", locked: false },
    { id: 3, title: "La famille et les relations", duration: "20 min", locked: false },
    { id: 4, title: "La maison et les meubles", duration: "25 min", locked: true },
    { id: 5, title: "Les vêtements et couleurs", duration: "20 min", locked: true },
    { id: 6, title: "La nourriture et les repas", duration: "30 min", locked: true },
    { id: 7, title: "Les transports", duration: "20 min", locked: true },
    { id: 8, title: "Le corps et la santé", duration: "25 min", locked: true },
    { id: 9, title: "Les loisirs et hobbies", duration: "20 min", locked: true },
    { id: 10, title: "Quiz final", duration: "30 min", locked: true },
];

export default function VocabularyPage() {
    return (
        <main id="main-content" className="course-page">
            <div className="container">
                <Link href="/courses" className="back-link"><ArrowLeft size={20} />Retour aux cours</Link>
                <div className="course-header">
                    <div className="course-badge">A1</div>
                    <div className="course-info">
                        <span className="course-emoji">🗣️</span>
                        <h1>Vocabulaire du quotidien</h1>
                        <p>Les mots et expressions essentiels pour la vie de tous les jours</p>
                        <div className="course-meta">
                            <span><Clock size={16} />3 heures</span>
                            <span><Users size={16} />3 200 étudiants</span>
                            <span className="rating"><Star size={16} fill="currentColor" />4.7</span>
                        </div>
                    </div>
                </div>
                <div className="course-content">
                    <div className="lessons-section">
                        <h2>Contenu du cours</h2>
                        <p className="lessons-count">{lessons.length} leçons • 3h de contenu</p>
                        <div className="lessons-list">
                            {lessons.map((lesson, i) => (
                                <div key={lesson.id} className={`lesson-item ${lesson.locked ? 'locked' : ''}`}>
                                    <div className="lesson-number">{i + 1}</div>
                                    <div className="lesson-info"><h3>{lesson.title}</h3><span className="lesson-duration"><Clock size={14} />{lesson.duration}</span></div>
                                    <div className="lesson-action">{lesson.locked ? <Lock size={18} /> : <PlayCircle size={24} />}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="sidebar">
                        <div className="progress-card">
                            <h3>Votre progression</h3>
                            <div className="progress-circle"><span>0%</span></div>
                            <p>Commencez le cours pour suivre votre progression</p>
                            <button className="btn btn-primary btn-full">Commencer le cours</button>
                        </div>
                        <div className="features-card">
                            <h4>Ce cours inclut :</h4>
                            <ul><li><CheckCircle size={16} />10 thèmes essentiels</li><li><CheckCircle size={16} />Flashcards interactives</li><li><CheckCircle size={16} />Audio par des natifs</li><li><CheckCircle size={16} />Certificat de complétion</li></ul>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
        .course-page{min-height:100vh;padding:3rem 0;background:var(--background)}
        .back-link{display:inline-flex;align-items:center;gap:.5rem;color:var(--primary-600);margin-bottom:2rem;font-weight:500}
        .course-header{display:flex;gap:2rem;align-items:flex-start;margin-bottom:3rem;padding:2rem;background:linear-gradient(135deg,var(--primary-50),var(--secondary-50));border-radius:var(--radius-xl)}
        .course-badge{width:4rem;height:4rem;display:flex;align-items:center;justify-content:center;background:#22c55e;color:white;font-size:1.5rem;font-weight:700;border-radius:var(--radius-xl)}
        .course-emoji{font-size:3rem;display:block;margin-bottom:.5rem}
        .course-info h1{font-size:2rem;margin-bottom:.5rem}
        .course-info>p{color:var(--muted-foreground);margin-bottom:1rem}
        .course-meta{display:flex;gap:1.5rem}
        .course-meta span{display:flex;align-items:center;gap:.5rem;color:var(--muted-foreground);font-size:.9rem}
        .rating{color:#f59e0b}
        .course-content{display:grid;grid-template-columns:1fr 320px;gap:2rem}
        .lessons-section h2{font-size:1.5rem;margin-bottom:.5rem}
        .lessons-count{color:var(--muted-foreground);margin-bottom:1.5rem}
        .lessons-list{display:flex;flex-direction:column;gap:.75rem}
        .lesson-item{display:flex;align-items:center;gap:1rem;padding:1rem;background:var(--card);border-radius:var(--radius-lg);cursor:pointer;transition:transform .2s}
        .lesson-item:hover:not(.locked){transform:translateX(4px)}
        .lesson-item.locked{opacity:.6;cursor:not-allowed}
        .lesson-number{width:2rem;height:2rem;display:flex;align-items:center;justify-content:center;background:var(--primary-100);color:var(--primary-600);border-radius:var(--radius-full);font-weight:600}
        .lesson-info{flex:1}
        .lesson-info h3{font-size:1rem;margin-bottom:.25rem}
        .lesson-duration{display:flex;align-items:center;gap:.25rem;font-size:.8rem;color:var(--muted-foreground)}
        .lesson-action{color:var(--primary-600)}
        .lesson-item.locked .lesson-action{color:var(--muted-foreground)}
        .sidebar{display:flex;flex-direction:column;gap:1.5rem}
        .progress-card,.features-card{background:var(--card);padding:1.5rem;border-radius:var(--radius-xl);box-shadow:var(--shadow-md)}
        .progress-card h3{margin-bottom:1rem;text-align:center}
        .progress-circle{width:100px;height:100px;margin:0 auto 1rem;border-radius:50%;background:conic-gradient(var(--primary-600) 0%,var(--muted) 0%);display:flex;align-items:center;justify-content:center}
        .progress-circle span{background:var(--card);width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:700}
        .progress-card>p{text-align:center;font-size:.875rem;color:var(--muted-foreground);margin-bottom:1rem}
        .btn-full{width:100%}
        .features-card h4{margin-bottom:1rem}
        .features-card ul{list-style:none;padding:0}
        .features-card li{display:flex;align-items:center;gap:.5rem;color:var(--muted-foreground);margin-bottom:.75rem}
        .features-card li svg{color:var(--primary-600)}
        @media(max-width:900px){.course-content{grid-template-columns:1fr}.course-header{flex-direction:column}}
      `}</style>
        </main>
    );
}
