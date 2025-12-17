'use client';

import Link from 'next/link';
import { ArrowLeft, Cookie, Shield, Eye, Settings } from 'lucide-react';

export default function CookiesPage() {
  return (
    <main className="cookies-page">
      <div className="container">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} />Retour à l'accueil
        </Link>

        <div className="header">
          <Cookie size={64} />
          <h1>Politique de Cookies</h1>
          <p className="subtitle">Dernière mise à jour : 17 décembre 2025</p>
        </div>

        <div className="content">
          <section>
            <h2>Qu'est-ce qu'un cookie ?</h2>
            <p>
              Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez notre site. 
              Ils nous aident à améliorer votre expérience et à fournir des fonctionnalités essentielles.
            </p>
          </section>

          <section>
            <h2>Types de cookies que nous utilisons</h2>
            
            <div className="cookie-type">
              <Shield size={24} />
              <div>
                <h3>Cookies essentiels</h3>
                <p>Nécessaires au fonctionnement du site (authentification, préférences de langue)</p>
              </div>
            </div>

            <div className="cookie-type">
              <Eye size={24} />
              <div>
                <h3>Cookies analytiques</h3>
                <p>Nous aident à comprendre comment vous utilisez notre site pour l'améliorer</p>
              </div>
            </div>

            <div className="cookie-type">
              <Settings size={24} />
              <div>
                <h3>Cookies de préférences</h3>
                <p>Mémorisent vos choix (thème sombre/clair, paramètres de langue)</p>
              </div>
            </div>
          </section>

          <section>
            <h2>Gestion des cookies</h2>
            <p>
              Vous pouvez contrôler et/ou supprimer les cookies selon vos souhaits. Vous pouvez supprimer tous 
              les cookies déjà sur votre ordinateur et configurer la plupart des navigateurs pour empêcher leur 
              installation.
            </p>
            <div className="info-box">
              <p><strong>Note :</strong> La désactivation de certains cookies peut affecter le fonctionnement du site.</p>
            </div>
          </section>

          <section>
            <h2>Consentement</h2>
            <p>
              En utilisant LexaFlow, vous acceptez l'utilisation de cookies conformément à cette politique. 
              Vous pouvez modifier vos préférences à tout moment via notre bandeau de consentement.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Pour toute question concernant notre utilisation des cookies, contactez-nous à : 
              <a href="mailto:privacy@lexaflow.com"> privacy@lexaflow.com</a>
            </p>
          </section>
        </div>
      </div>

      <style jsx>{`
        .cookies-page { min-height: 100vh; padding: 3rem 0; }
        .header { text-align: center; margin: 2rem 0 3rem; }
        .header svg { color: var(--primary-600); margin-bottom: 1rem; }
        .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .subtitle { color: var(--muted-foreground); font-size: 0.9375rem; }
        .content { max-width: 800px; margin: 0 auto; }
        section { margin-bottom: 3rem; }
        h2 { font-size: 1.75rem; margin-bottom: 1rem; color: var(--primary-600); }
        h3 { font-size: 1.125rem; margin-bottom: 0.5rem; }
        p { line-height: 1.7; color: var(--muted-foreground); margin-bottom: 1rem; }
        .cookie-type { display: flex; gap: 1rem; padding: 1.5rem; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); margin-bottom: 1rem; }
        .cookie-type svg { color: var(--primary-600); flex-shrink: 0; margin-top: 0.25rem; }
        .info-box { background: var(--warning-50); border-left: 4px solid var(--warning-600); padding: 1rem; border-radius: var(--radius-lg); margin-top: 1.5rem; }
        :global([data-theme="dark"]) .info-box { background: rgba(251, 191, 36, 0.1); }
        a { color: var(--primary-600); text-decoration: underline; }
      `}</style>
    </main>
  );
}
