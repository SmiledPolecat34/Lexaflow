'use client';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <main id="main-content" className="legal-page">
            <div className="container">
                <Link href="/" className="back-link">
                    <ArrowLeft size={20} />
                    Retour à l'accueil
                </Link>

                <div className="legal-content">
                    <div className="header-icon">
                        <Shield size={40} />
                    </div>
                    <h1>Politique de Confidentialité</h1>
                    <p className="last-updated">Dernière mise à jour : 13 décembre 2024</p>

                    <section>
                        <h2>1. Introduction</h2>
                        <p>
                            Chez LexaFlow, nous prenons la protection de vos données personnelles très au sérieux.
                            Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons
                            vos informations lorsque vous utilisez notre service.
                        </p>
                    </section>

                    <section>
                        <h2>2. Données collectées</h2>
                        <p>Nous collectons les types de données suivants :</p>
                        <ul>
                            <li><strong>Informations de compte :</strong> nom, adresse email, mot de passe chiffré</li>
                            <li><strong>Données d'apprentissage :</strong> progression, scores, exercices complétés</li>
                            <li><strong>Données techniques :</strong> adresse IP, type de navigateur, appareil utilisé</li>
                            <li><strong>Données d'utilisation :</strong> pages visitées, temps passé, interactions</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Utilisation des données</h2>
                        <p>Vos données sont utilisées pour :</p>
                        <ul>
                            <li>Fournir et améliorer nos services d'apprentissage</li>
                            <li>Personnaliser votre expérience et adapter les exercices à votre niveau</li>
                            <li>Suivre votre progression et générer des statistiques</li>
                            <li>Communiquer avec vous concernant votre compte</li>
                            <li>Assurer la sécurité de notre plateforme</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Partage des données</h2>
                        <p>
                            Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données avec :
                        </p>
                        <ul>
                            <li>Des prestataires de services (hébergement, analyse) sous contrat de confidentialité</li>
                            <li>Les autorités si la loi l'exige</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Conservation des données</h2>
                        <p>
                            Vos données sont conservées tant que votre compte est actif. Après suppression de votre
                            compte, nous conservons certaines données anonymisées à des fins statistiques.
                        </p>
                    </section>

                    <section>
                        <h2>6. Sécurité</h2>
                        <p>
                            Nous utilisons des mesures de sécurité techniques et organisationnelles pour protéger
                            vos données, incluant le chiffrement SSL, le hachage des mots de passe et des audits
                            réguliers de sécurité.
                        </p>
                    </section>

                    <section>
                        <h2>7. Vos droits</h2>
                        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                        <ul>
                            <li>Droit d'accès à vos données</li>
                            <li>Droit de rectification</li>
                            <li>Droit à l'effacement</li>
                            <li>Droit à la portabilité</li>
                            <li>Droit d'opposition</li>
                        </ul>
                        <p>
                            Pour exercer ces droits, contactez-nous à{' '}
                            <a href="mailto:versayo03@gmail.com">versayo03@gmail.com</a>
                        </p>
                    </section>

                    <section>
                        <h2>8. Cookies</h2>
                        <p>
                            Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies
                            analytiques pour améliorer notre service. Vous pouvez gérer vos préférences de cookies
                            dans les paramètres de votre navigateur.
                        </p>
                    </section>

                    <section>
                        <h2>9. Contact</h2>
                        <p>
                            Pour toute question concernant cette politique, contactez notre délégué à la protection
                            des données à <a href="mailto:versayo03@gmail.com">versayo03@gmail.com</a>
                        </p>
                    </section>
                </div>
            </div>

            <style jsx>{`
        .legal-page {
          min-height: 100vh;
          padding: 3rem 0;
          background: var(--background);
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

        .legal-content {
          max-width: 800px;
          margin: 0 auto;
          background: var(--card);
          padding: 3rem;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
        }

        .header-icon {
          width: 4rem;
          height: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-100), var(--secondary-100));
          color: var(--primary-600);
          border-radius: var(--radius-xl);
          margin-bottom: 1.5rem;
        }

        h1 {
          font-size: 2.5rem;
          background: linear-gradient(135deg, var(--primary-600), var(--secondary-500));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .last-updated {
          color: var(--muted-foreground);
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        section {
          margin-bottom: 2rem;
        }

        h2 {
          font-size: 1.25rem;
          color: var(--foreground);
          margin-bottom: 0.75rem;
        }

        p {
          color: var(--muted-foreground);
          line-height: 1.7;
          margin-bottom: 1rem;
        }

        ul {
          color: var(--muted-foreground);
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }

        strong {
          color: var(--foreground);
        }

        a {
          color: var(--primary-600);
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .legal-content {
            padding: 1.5rem;
          }

          h1 {
            font-size: 1.75rem;
          }
        }
      `}</style>
        </main>
    );
}
