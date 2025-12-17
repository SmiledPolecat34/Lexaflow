'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Brain, Trophy, Zap, Check, Star } from 'lucide-react';


export default function HomePage() {
    return (
        <main id="main-content">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content animate-slideUp">
                        <span className="badge badge-primary">🎓 Nouvelle plateforme d'apprentissage</span>
                        <h1 className="hero-title">
                            Maîtrisez l'anglais avec{' '}
                            <span className="text-gradient">LexaFlow</span>
                        </h1>
                        <p className="hero-description">
                            Des exercices interactifs, des cours adaptés à votre niveau et une IA pédagogique
                            pour vous accompagner dans votre apprentissage de l'anglais.
                        </p>
                        <div className="hero-actions">
                            <Link href="/register" className="btn btn-primary btn-lg">
                                Commencer gratuitement
                                <ArrowRight size={20} />
                            </Link>
                            <Link href="/login" className="btn btn-outline btn-lg">
                                Se connecter
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-value">10K+</span>
                                <span className="stat-label">Utilisateurs</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">500+</span>
                                <span className="stat-label">Exercices</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">6</span>
                                <span className="stat-label">Niveaux CECR</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <div className="section-header">
                        <h2>Pourquoi choisir LexaFlow ?</h2>
                        <p>Une approche moderne et efficace pour progresser en anglais</p>
                    </div>
                    <div className="grid grid-cols-3">
                        <FeatureCard
                            icon={<Brain />}
                            title="IA Pédagogique"
                            description="Des exercices générés par IA adaptés à votre niveau et vos centres d'intérêt."
                        />
                        <FeatureCard
                            icon={<BookOpen />}
                            title="Cours Structurés"
                            description="Grammaire, conjugaison et vocabulaire avec des explications claires."
                        />
                        <FeatureCard
                            icon={<Trophy />}
                            title="Gamification"
                            description="Badges, streaks et challenges pour rester motivé au quotidien."
                        />
                        <FeatureCard
                            icon={<Zap />}
                            title="Feedback Instantané"
                            description="Corrections détaillées et explications après chaque exercice."
                        />
                        <FeatureCard
                            icon={<Star />}
                            title="Suivi de Progression"
                            description="Visualisez vos progrès et identifiez vos points faibles."
                        />
                        <FeatureCard
                            icon={<Check />}
                            title="Test de Niveau"
                            description="Évaluez votre niveau CECR avec notre test de placement."
                        />
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <h2>Comment ça marche ?</h2>
                        <p>Trois étapes simples pour commencer votre apprentissage</p>
                    </div>
                    <div className="steps">
                        <Step
                            number={1}
                            title="Créez votre compte"
                            description="Inscription gratuite en quelques secondes avec email ou Google."
                        />
                        <Step
                            number={2}
                            title="Passez le test de niveau"
                            description="25 questions pour évaluer votre niveau actuel (A1 à C2)."
                        />
                        <Step
                            number={3}
                            title="Commencez à apprendre"
                            description="Accédez à des exercices et cours adaptés à votre niveau."
                        />
                    </div>
                </div>
            </section>

            {/* Levels Section */}
            <section className="levels">
                <div className="container">
                    <div className="section-header">
                        <h2>Tous les niveaux CECR</h2>
                        <p>Du débutant au niveau avancé</p>
                    </div>
                    <div className="level-cards">
                        <LevelCard level="A1" name="Débutant" color="#22c55e" />
                        <LevelCard level="A2" name="Élémentaire" color="#84cc16" />
                        <LevelCard level="B1" name="Intermédiaire" color="#eab308" />
                        <LevelCard level="B2" name="Intermédiaire sup." color="#f97316" />
                        <LevelCard level="C1" name="Avancé" color="#ef4444" />
                        <LevelCard level="C2" name="Maîtrise" color="#8b5cf6" />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-card">
                        <h2>Prêt à améliorer votre anglais ?</h2>
                        <p>Rejoignez des milliers d'apprenants et commencez gratuitement aujourd'hui.</p>
                        <Link href="/register" className="btn btn-primary btn-lg">
                            Créer mon compte gratuit
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            <style jsx>{`
        .hero {
          padding: 6rem 0;
          background: linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%);
        }
        
        .hero-content {
          max-width: 800px;
          text-align: center;
          margin: 0 auto;
        }
        
        .hero-title {
          font-size: 3.5rem;
          line-height: 1.1;
          margin: 1.5rem 0;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, var(--primary-600), var(--secondary-500));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hero-description {
          font-size: 1.25rem;
          color: var(--muted-foreground);
          max-width: 600px;
          margin: 0 auto 2rem;
        }
        
        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .hero-stats {
          display: flex;
          gap: 3rem;
          justify-content: center;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
        }
        
        .stat {
          text-align: center;
        }
        
        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary-600);
        }
        
        .stat-label {
          color: var(--muted-foreground);
          font-size: 0.875rem;
        }
        
        .features, .how-it-works, .levels, .cta {
          padding: 5rem 0;
        }
        
        .features {
          background: var(--background);
        }
        
        .how-it-works {
          background: var(--muted);
        }
        
        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .section-header h2 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        
        .section-header p {
          color: var(--muted-foreground);
          font-size: 1.125rem;
        }
        
        .steps {
          display: flex;
          gap: 2rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .level-cards {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .cta-card {
          text-align: center;
          padding: 4rem;
          background: linear-gradient(135deg, var(--primary-600), var(--secondary-600));
          border-radius: var(--radius-2xl);
          color: white;
        }
        
        .cta-card h2 {
          color: white;
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        
        .cta-card p {
          opacity: 0.9;
          margin-bottom: 2rem;
        }
        
        .footer {
          background: var(--gray-900);
          color: var(--gray-300);
          padding: 4rem 0 2rem;
        }
        
        .footer-content {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 3rem;
          margin-bottom: 3rem;
        }
        
        .footer-brand {
          max-width: 300px;
        }
        
        .footer-brand .nav-brand {
          color: white;
          margin-bottom: 1rem;
          display: block;
        }
        
        .footer-links {
          display: flex;
          gap: 4rem;
        }
        
        .footer-column h4 {
          color: white;
          margin-bottom: 1rem;
        }
        
        .footer-column a {
          display: block;
          color: var(--gray-400);
          padding: 0.25rem 0;
        }
        
        .footer-column a:hover {
          color: white;
        }
        
        .footer-bottom {
          border-top: 1px solid var(--gray-800);
          padding-top: 2rem;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-stats {
            gap: 1.5rem;
          }
          
          .footer-links {
            gap: 2rem;
          }
        }
      `}</style>
        </main>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="card card-interactive">
            <div className="feature-icon">{icon}</div>
            <h3 className="card-title">{title}</h3>
            <p className="card-description">{description}</p>
            <style jsx>{`
        .feature-icon {
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary-100);
          color: var(--primary-600);
          border-radius: var(--radius-lg);
          margin-bottom: 1rem;
        }
      `}</style>
        </div>
    );
}

function Step({
    number,
    title,
    description,
}: {
    number: number;
    title: string;
    description: string;
}) {
    return (
        <div className="step">
            <div className="step-number">{number}</div>
            <h3>{title}</h3>
            <p>{description}</p>
            <style jsx>{`
        .step {
          text-align: center;
          max-width: 280px;
        }
        
        .step-number {
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary-600);
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 1.25rem;
          margin: 0 auto 1rem;
        }
        
        .step h3 {
          margin-bottom: 0.5rem;
        }
        
        .step p {
          color: var(--muted-foreground);
        }
      `}</style>
        </div>
    );
}

function LevelCard({
    level,
    name,
    color,
}: {
    level: string;
    name: string;
    color: string;
}) {
    return (
        <div className="level-card" style={{ '--level-color': color } as React.CSSProperties}>
            <span className="level-badge">{level}</span>
            <span className="level-name">{name}</span>
            <style jsx>{`
        .level-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1.5rem 2rem;
          background: var(--card);
          border-radius: var(--radius-xl);
          border: 2px solid var(--level-color);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .level-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px var(--level-color);
        }
        
        .level-badge {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--level-color);
        }
        
        .level-name {
          font-size: 0.875rem;
          color: var(--muted-foreground);
        }
      `}</style>
        </div>
    );
}
