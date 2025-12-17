'use client';

import Link from 'next/link';
import { ArrowLeft, Globe, FileText, BookOpen, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="about-page">
      <div className="container">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} />Retour à l'accueil
        </Link>

        <div className="hero">
          <h1>À propos de LexaFlow</h1>
          <p className="tagline">Révolutionner l'apprentissage de l'anglais avec l'IA</p>
        </div>

        <div className="content">
          <section className="mission">
            <div className="icon-badge">
              <Zap size={32} />
            </div>
            <h2>Notre Mission</h2>
            <p>
              LexaFlow a été créé avec une vision simple : rendre l'apprentissage de l'anglais 
              accessible, efficace et engageant pour tous. Nous croyons que chacun devrait avoir 
              accès à une éducation de qualité, personnalisée selon ses besoins.
            </p>
          </section>

          <section className="features">
            <h2>Ce qui nous rend uniques</h2>
            <div className="features-grid">
              <div className="feature-card">
                <Globe size={40} />
                <h3>IA Avancée</h3>
                <p>Exercices générés par intelligence artificielle adaptés à votre niveau</p>
              </div>
              <div className="feature-card">
                <FileText size={40} />
                <h3>Contenu Personnalisé</h3>
                <p>Des leçons qui s'adaptent à votre style d'apprentissage</p>
              </div>
              <div className="feature-card">
                <BookOpen size={40} />
                <h3>Méthode Pédagogique</h3>
                <p>Basée sur les dernières recherches en acquisition de langues</p>
              </div>
            </div>
          </section>

          <section className="team">
            <h2>L'Équipe</h2>
            <p>
              LexaFlow est développé par une équipe passionnée d'éducateurs, de développeurs 
              et d'experts en IA, tous dédiés à créer la meilleure expérience d'apprentissage possible.
            </p>
          </section>

          <section className="cta">
            <h2>Prêt à commencer ?</h2>
            <p>Rejoignez des milliers d'apprenants qui progressent avec LexaFlow</p>
            <Link href="/register" className="btn btn-primary btn-lg">
              Commencer gratuitement
            </Link>
          </section>
        </div>
      </div>

      <style jsx>{`
        .about-page { min-height: 100vh; padding: 3rem 0; }
        .hero { text-align: center; margin: 3rem 0 4rem; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .tagline { font-size: 1.25rem; color: var(--muted-foreground); }
        .content { max-width: 800px; margin: 0 auto; }
        section { margin-bottom: 4rem; }
        .mission { text-align: center; }
        .icon-badge { width: 80px; height: 80px; margin: 0 auto 1.5rem; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: var(--radius-xl); display: flex; align-items: center; justify-content: center; color: white; }
        h2 { font-size: 2rem; margin-bottom: 1.5rem; }
        p { line-height: 1.8; color: var(--muted-foreground); margin-bottom: 1rem; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 2rem; }
        .feature-card { background: var(--card); padding: 2rem; border-radius: var(--radius-xl); border: 1px solid var(--border); text-align: center; transition: transform 0.2s; }
        .feature-card:hover { transform: translateY(-4px); }
        .feature-card svg { color: var(--primary-600); margin-bottom: 1rem; }
        .feature-card h3 { font-size: 1.25rem; margin-bottom: 0.75rem; }
        .cta { text-align: center; background: linear-gradient(135deg, var(--primary-50), var(--secondary-50)); padding: 3rem; border-radius: var(--radius-2xl); }
        .cta h2 { margin-bottom: 0.75rem; }
        .cta .btn { margin-top: 1.5rem; }
      `}</style>
    </main>
  );
}
