'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
    return (
        <main id="main-content" className="legal-page">
            <div className="container">
                <Link href="/" className="back-link">
                    <ArrowLeft size={20} />
                    Retour à l'accueil
                </Link>

                <div className="legal-content">
                    <h1>Conditions Générales d'Utilisation</h1>
                    <p className="last-updated">Dernière mise à jour : 13 décembre 2024</p>

                    <section>
                        <h2>1. Acceptation des conditions</h2>
                        <p>
                            En accédant et en utilisant LexaFlow, vous acceptez d'être lié par ces conditions générales
                            d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                        </p>
                    </section>

                    <section>
                        <h2>2. Description du service</h2>
                        <p>
                            LexaFlow est une plateforme d'apprentissage de l'anglais qui propose des exercices interactifs,
                            des cours structurés et un suivi de progression personnalisé. Notre service utilise l'intelligence
                            artificielle pour adapter le contenu à votre niveau.
                        </p>
                    </section>

                    <section>
                        <h2>3. Inscription et compte utilisateur</h2>
                        <p>
                            Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable
                            de maintenir la confidentialité de vos identifiants de connexion et de toutes les activités
                            effectuées sous votre compte.
                        </p>
                        <ul>
                            <li>Vous devez fournir des informations exactes et à jour</li>
                            <li>Vous devez avoir au moins 13 ans pour utiliser le service</li>
                            <li>Un compte par personne est autorisé</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Propriété intellectuelle</h2>
                        <p>
                            Tout le contenu présent sur LexaFlow (textes, exercices, design, logos) est protégé par
                            les droits de propriété intellectuelle. Toute reproduction ou utilisation non autorisée
                            est strictement interdite.
                        </p>
                    </section>

                    <section>
                        <h2>5. Utilisation acceptable</h2>
                        <p>Vous vous engagez à ne pas :</p>
                        <ul>
                            <li>Partager votre compte avec d'autres personnes</li>
                            <li>Tenter de contourner les mesures de sécurité</li>
                            <li>Utiliser le service à des fins illégales</li>
                            <li>Collecter des données d'autres utilisateurs</li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Modifications du service</h2>
                        <p>
                            Nous nous réservons le droit de modifier, suspendre ou interrompre tout ou partie du
                            service à tout moment, avec ou sans préavis.
                        </p>
                    </section>

                    <section>
                        <h2>7. Limitation de responsabilité</h2>
                        <p>
                            LexaFlow est fourni "tel quel". Nous ne garantissons pas que le service sera ininterrompu
                            ou exempt d'erreurs. Notre responsabilité est limitée au maximum autorisé par la loi.
                        </p>
                    </section>

                    <section>
                        <h2>8. Contact</h2>
                        <p>
                            Pour toute question concernant ces conditions, contactez-nous à{' '}
                            <a href="mailto:versayo03@gmail.com">versayo03@gmail.com</a>
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
