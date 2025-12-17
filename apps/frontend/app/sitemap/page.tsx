'use client';

import Link from 'next/link';
import { ArrowLeft, Home, BookOpen, Zap, Award, User } from 'lucide-react';

const sitemapSections = [
  {
    title: "Principal",
    icon: Home,
    links: [
      { href: "/", label: "Accueil" },
      { href: "/about", label: "À propos" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ]
  },
  {
    title: "Apprentissage",
    icon: BookOpen,
    links: [
      { href: "/courses", label: "Cours" },
      { href: "/exercises", label: "Exercices" },
      { href: "/courses/vocabulary", label: "Vocabulaire" },
      { href: "/courses/verb-tenses", label: "Temps verbaux" },
    ]
  },
  {
    title: "Fonctionnalités",
    icon: Zap,
    links: [
      { href: "/dashboard", label: "Tableau de bord" },
      { href: "/progress", label: "Progression" },
      { href: "/dashboard/settings", label: "Paramètres" },
    ]
  },
  {
    title: "Compte",
    icon: User,
    links: [
      { href: "/login", label: "Connexion" },
      { href: "/register", label: "Inscription" },
    ]
  },
  {
    title: "Légal",
    icon: Award,
    links: [
      { href: "/privacy", label: "Politique de confidentialité" },
      { href: "/terms", label: "Conditions d'utilisation" },
      { href: "/cookies", label: "Politique de cookies" },
    ]
  },
];

export default function SitemapPage() {
  return (
    <main className="sitemap-page">
      <div className="container">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} />Retour à l'accueil
        </Link>

        <div className="header">
          <h1>Plan du site</h1>
          <p className="subtitle">Explorez toutes les pages de LexaFlow</p>
        </div>

        <div className="sitemap-grid">
          {sitemapSections.map((section) => (
            <div key={section.title} className="sitemap-section">
              <div className="section-header">
                <section.icon size={24} />
                <h2>{section.title}</h2>
              </div>
              <ul className="links-list">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="help-section">
          <h3>Vous ne trouvez pas ce que vous cherchez ?</h3>
          <p>N'hésitez pas à nous contacter pour toute question</p>
          <Link href="/contact" className="btn btn-primary">
            Nous contacter
          </Link>
        </div>
      </div>

      <style jsx>{`
        .sitemap-page { min-height: 100vh; padding: 3rem 0; }
        .header { text-align: center; margin: 2rem 0 3rem; }
        .header h1 { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .subtitle { color: var(--muted-foreground); font-size: 1.125rem; }
        .sitemap-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin: 3rem 0 4rem; }
        .sitemap-section { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 2rem; }
        .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border); }
        .section-header svg { color: var(--primary-600); }
        .section-header h2 { font-size: 1.25rem; margin: 0; }
        .links-list { list-style: none; padding: 0; margin: 0; }
        .links-list li { margin-bottom: 0.75rem; }
        .links-list a { color: var(--muted-foreground); font-size: 0.9375rem; transition: all 0.2s; display: inline-block; }
        .links-list a:hover { color: var(--primary-600); transform: translateX(4px); text-decoration: none; }
        .help-section { text-align: center; background: linear-gradient(135deg, var(--primary-50), var(--secondary-50)); padding: 3rem; border-radius: var(--radius-2xl); }
        .help-section h3 { font-size: 1.5rem; margin-bottom: 0.75rem; }
        .help-section p { color: var(--muted-foreground); margin-bottom: 1.5rem; }
      `}</style>
    </main>
  );
}
