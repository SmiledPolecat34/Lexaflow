'use client';

import Link from 'next/link';
import { ArrowLeft, PenTool, BookOpen, TrendingUp } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: "10 astuces pour améliorer votre anglais rapidement",
    excerpt: "Découvrez nos méthodes éprouvées pour progresser efficacement en anglais",
    category: "Conseils",
    date: "15 décembre 2025",
    readTime: "5 min",
    icon: PenTool,
  },
  {
    id: 2,
    title: "L'importance de la pratique quotidienne",
    excerpt: "Pourquoi 15 minutes par jour valent mieux que 2 heures le weekend",
    category: "Méthodologie",
    date: "10 décembre 2025",
    readTime: "4 min",
    icon: TrendingUp,
  },
  {
    id: 3,
    title: "Comment l'IA révolutionne l'apprentissage des langues",
    excerpt: "Exploration des technologies qui transforment l'éducation linguistique",
    category: "Technologie",
    date: "5 décembre 2025",
    readTime: "6 min",
    icon: BookOpen,
  },
];

export default function BlogPage() {
  return (
    <main className="blog-page">
      <div className="container">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} />Retour à l'accueil
        </Link>

        <div className="header">
          <h1>Blog LexaFlow</h1>
          <p className="tagline">
            Conseils, astuces et dernières nouvelles pour maîtriser l'anglais
          </p>
        </div>

        <div className="blog-grid">
          {blogPosts.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="card-icon">
                <post.icon size={32} />
              </div>
              <div className="card-content">
                <div className="card-meta">
                  <span className="category">{post.category}</span>
                  <span className="separator">•</span>
                  <span className="date">{post.date}</span>
                  <span className="separator">•</span>
                  <span className="read-time">{post.readTime}</span>
                </div>
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
                <Link href={`/blog/${post.id}`} className="read-more">
                  Lire l'article →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="coming-soon">
          <h3>Plus d'articles bientôt !</h3>
          <p>Nous publions régulièrement de nouveaux contenus pour vous aider dans votre apprentissage.</p>
          <Link href="/register" className="btn btn-primary">
            S'inscrire à la newsletter
          </Link>
        </div>
      </div>

      <style jsx>{`
        .blog-page { min-height: 100vh; padding: 3rem 0; }
        .header { text-align: center; margin: 2rem 0 4rem; }
        .header h1 { font-size: 3rem; margin-bottom: 1rem; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .tagline { font-size: 1.125rem; color: var(--muted-foreground); max-width: 600px; margin: 0 auto; }
        .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem; margin-bottom: 4rem; }
        .blog-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 2rem; transition: all 0.2s; }
        .blog-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); border-color: var(--primary-300); }
        .card-icon { width: 64px; height: 64px; background: linear-gradient(135deg, #ddd6fe, #e9d5ff); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; color: #6d28d9; }
        .card-meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--muted-foreground); margin-bottom: 1rem; flex-wrap: wrap; }
        .category { color: var(--primary-600); font-weight: 600; }
        .separator { opacity: 0.5; }
        .blog-card h2 { font-size: 1.5rem; margin-bottom: 0.75rem; line-height: 1.3; }
        .blog-card p { color: var(--muted-foreground); line-height: 1.6; margin-bottom: 1.5rem; }
        .read-more { color: var(--primary-600); font-weight: 600; transition: gap 0.2s; display: inline-flex; align-items: center; }
        .read-more:hover { gap: 0.5rem; }
        .coming-soon { text-align: center; background: linear-gradient(135deg, var(--primary-50), var(--secondary-50)); padding: 3rem; border-radius: var(--radius-2xl); }
        .coming-soon h3 { font-size: 1.75rem; margin-bottom: 0.75rem; }
        .coming-soon p { color: var(--muted-foreground); margin-bottom: 1.5rem; }
        @media (max-width: 768px) { .blog-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
