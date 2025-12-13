'use client';

import Link from 'next/link';
import { ArrowLeft, Database, Download, Trash2, Edit, Eye, Ban } from 'lucide-react';

export default function GDPRPage() {
    return (
        <main id="main-content" className="legal-page">
            <div className="container">
                <Link href="/" className="back-link">
                    <ArrowLeft size={20} />
                    Retour à l'accueil
                </Link>

                <div className="legal-content">
                    <div className="header-badge">RGPD</div>
                    <h1>Protection des Données - RGPD</h1>
                    <p className="subtitle">
                        Règlement Général sur la Protection des Données
                    </p>

                    <div className="intro-card">
                        <p>
                            LexaFlow s'engage à respecter le Règlement Général sur la Protection des Données (RGPD)
                            de l'Union Européenne. Cette page vous informe sur vos droits et comment les exercer.
                        </p>
                    </div>

                    <section>
                        <h2>Vos droits sur vos données</h2>
                        <div className="rights-grid">
                            <div className="right-card">
                                <div className="right-icon"><Eye size={24} /></div>
                                <h3>Droit d'accès</h3>
                                <p>Obtenez une copie de toutes les données que nous détenons sur vous.</p>
                            </div>
                            <div className="right-card">
                                <div className="right-icon"><Edit size={24} /></div>
                                <h3>Droit de rectification</h3>
                                <p>Corrigez les informations inexactes ou incomplètes vous concernant.</p>
                            </div>
                            <div className="right-card">
                                <div className="right-icon"><Trash2 size={24} /></div>
                                <h3>Droit à l'effacement</h3>
                                <p>Demandez la suppression de vos données personnelles.</p>
                            </div>
                            <div className="right-card">
                                <div className="right-icon"><Download size={24} /></div>
                                <h3>Droit à la portabilité</h3>
                                <p>Récupérez vos données dans un format structuré et lisible.</p>
                            </div>
                            <div className="right-card">
                                <div className="right-icon"><Ban size={24} /></div>
                                <h3>Droit d'opposition</h3>
                                <p>Opposez-vous au traitement de vos données pour certaines finalités.</p>
                            </div>
                            <div className="right-card">
                                <div className="right-icon"><Database size={24} /></div>
                                <h3>Droit à la limitation</h3>
                                <p>Limitez temporairement le traitement de vos données.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2>Responsable du traitement</h2>
                        <div className="info-box">
                            <p><strong>LexaFlow</strong></p>
                            <p>Email : <a href="mailto:versayo03@gmail.com">versayo03@gmail.com</a></p>
                        </div>
                    </section>

                    <section>
                        <h2>Base légale du traitement</h2>
                        <p>Nous traitons vos données sur les bases légales suivantes :</p>
                        <ul>
                            <li><strong>Exécution du contrat :</strong> pour fournir nos services d'apprentissage</li>
                            <li><strong>Consentement :</strong> pour les communications marketing (révocable à tout moment)</li>
                            <li><strong>Intérêt légitime :</strong> pour améliorer nos services et assurer la sécurité</li>
                            <li><strong>Obligation légale :</strong> pour respecter nos obligations réglementaires</li>
                        </ul>
                    </section>

                    <section>
                        <h2>Exercer vos droits</h2>
                        <p>
                            Pour exercer l'un de vos droits, vous pouvez nous contacter à{' '}
                            <a href="mailto:versayo03@gmail.com">versayo03@gmail.com</a>.
                            Nous répondrons à votre demande dans un délai de 30 jours.
                        </p>
                        <div className="action-buttons">
                            <Link href="/contact" className="btn btn-primary">
                                Faire une demande
                            </Link>
                            <Link href="/privacy" className="btn btn-outline">
                                Voir la politique de confidentialité
                            </Link>
                        </div>
                    </section>

                    <section>
                        <h2>Réclamation</h2>
                        <p>
                            Si vous estimez que le traitement de vos données n'est pas conforme au RGPD,
                            vous pouvez introduire une réclamation auprès de la CNIL (Commission Nationale
                            de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
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
          max-width: 900px;
          margin: 0 auto;
          background: var(--card);
          padding: 3rem;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
        }

        .header-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, var(--primary-600), var(--secondary-600));
          color: white;
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        h1 {
          font-size: 2.5rem;
          color: var(--foreground);
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: var(--muted-foreground);
          font-size: 1.125rem;
          margin-bottom: 2rem;
        }

        .intro-card {
          background: linear-gradient(135deg, var(--primary-50), var(--secondary-50));
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          border-left: 4px solid var(--primary-600);
          margin-bottom: 2.5rem;
        }

        .intro-card p {
          color: var(--foreground);
          margin: 0;
          line-height: 1.7;
        }

        section {
          margin-bottom: 2.5rem;
        }

        h2 {
          font-size: 1.5rem;
          color: var(--foreground);
          margin-bottom: 1rem;
        }

        h3 {
          font-size: 1rem;
          color: var(--foreground);
          margin-bottom: 0.5rem;
        }

        p {
          color: var(--muted-foreground);
          line-height: 1.7;
          margin-bottom: 1rem;
        }

        .rights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .right-card {
          background: var(--muted);
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .right-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .right-icon {
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

        .right-card p {
          font-size: 0.875rem;
          margin: 0;
        }

        .info-box {
          background: var(--muted);
          padding: 1.5rem;
          border-radius: var(--radius-lg);
        }

        .info-box p {
          margin: 0.25rem 0;
        }

        ul {
          color: var(--muted-foreground);
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        li {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }

        strong {
          color: var(--foreground);
        }

        a {
          color: var(--primary-600);
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .legal-content {
            padding: 1.5rem;
          }

          h1 {
            font-size: 1.75rem;
          }

          .rights-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </main>
    );
}
