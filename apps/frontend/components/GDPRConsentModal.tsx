'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, FileText, CheckCircle } from 'lucide-react';
import { userApi } from '@/lib/api';

interface GDPRConsentModalProps {
    onConsent: () => void;
}

export default function GDPRConsentModal({ onConsent }: GDPRConsentModalProps) {
    const [accepted, setAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleAccept = async () => {
        if (!accepted) return;

        try {
            setSubmitting(true);
            const response = await userApi.giveConsent(true);
            if (response.data || !response.error) {
                onConsent();
            }
        } catch (error) {
            console.error('Failed to give consent:', error);
            alert('Erreur lors de l\'enregistrement du consentement');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="gdpr-modal-overlay">
            <div className="gdpr-modal">
                <div className="modal-header">
                    <Shield size={48} />
                    <h1>Protection de vos données</h1>
                    <p>Nous respectons votre vie privée</p>
                </div>

                <div className="modal-content">
                    <div className="consent-info">
                        <h2>Utilisation de vos données</h2>
                        <p>
                            Pour vous offrir la meilleure expérience d&apos;apprentissage, nous collectons et
                            utilisons certaines données personnelles :
                        </p>
                        <ul>
                            <li>
                                <CheckCircle size={16} />
                                Vos résultats d&apos;exercices pour suivre votre progression
                            </li>
                            <li>
                                <CheckCircle size={16} />
                                Vos préférences d&apos;apprentissage pour personnaliser le contenu
                            </li>
                            <li>
                                <CheckCircle size={16} />
                                Votre activité pour maintenir votre série de jours consécutifs
                            </li>
                        </ul>

                        <h3>Vos droits</h3>
                        <p>Vous disposez de droits sur vos données :</p>
                        <ul>
                            <li>Droit d&apos;accès et de rectification</li>
                            <li>Droit à l&apos;export de toutes vos données</li>
                            <li>Droit à la suppression de votre compte</li>
                            <li>Droit de retirer votre consentement à tout moment</li>
                        </ul>

                        <div className="links">
                            <Link href="/privacy" target="_blank">
                                <FileText size={16} />
                                Politique de confidentialité complète
                            </Link>
                            <Link href="/terms" target="_blank">
                                <FileText size={16} />
                                Conditions d&apos;utilisation
                            </Link>
                        </div>
                    </div>

                    <div className="consent-checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                            />
                            <span className="text-black-500">
                                J&apos;accepte que mes données soient collectées et traitées conformément à
                                la politique de confidentialité. Ce consentement est nécessaire pour
                                utiliser Lexaflow.
                            </span>
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button
                            onClick={handleAccept}
                            disabled={!accepted || submitting}
                            className="btn btn-primary"
                        >
                            {submitting ? 'Enregistrement...' : 'Accepter et continuer'}
                        </button>
                    </div>

                    <p className="modal-note">
                        Sans consentement, vous ne pourrez pas utiliser la plateforme. Vous pourrez
                        modifier vos préférences ou retirer votre consentement à tout moment dans les
                        paramètres.
                    </p>
                </div>
            </div>

            <style jsx>{`
                .gdpr-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 1rem;
                    overflow-y: auto;
                }

                .gdpr-modal {
                    background: var(--card);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-xl);
                    max-width: 600px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-header {
                    text-align: center;
                    padding: 2rem 2rem 1rem;
                    border-bottom: 1px solid var(--border);
                }

                .modal-header svg {
                    color: var(--primary-600);
                    margin-bottom: 1rem;
                }

                .modal-header h1 {
                    font-size: 1.75rem;
                    margin-bottom: 0.5rem;
                }

                .modal-header p {
                    color: var(--muted-foreground);
                }

                .modal-content {
                    padding: 2rem;
                }

                .consent-info h2 {
                    font-size: 1.25rem;
                    margin-bottom: 0.75rem;
                }

                .consent-info h3 {
                    font-size: 1.125rem;
                    margin: 1.5rem 0 0.75rem;
                }

                .consent-info p {
                    color: var(--muted-foreground);
                    line-height: 1.6;
                    margin-bottom: 1rem;
                }

                .consent-info ul {
                    list-style: none;
                    padding: 0;
                    margin-bottom: 1.5rem;
                }

                .consent-info ul li {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                    color: var(--foreground);
                }

                .consent-info ul li svg {
                    color: var(--primary-600);
                    flex-shrink: 0;
                    margin-top: 0.25rem;
                }

                .links {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-top: 1.5rem;
                    padding: 1rem;
                    background: var(--muted);
                    border-radius: var(--radius-lg);
                }

                .links a {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--primary-600);
                    font-weight: 500;
                    text-decoration: none;
                }

                .links a:hover {
                    text-decoration: underline;
                }

                .consent-checkbox {
                    margin: 2rem 0;
                    padding: 1.5rem;
                    background: var(--primary-50);
                    border: 2px solid var(--primary-200);
                    border-radius: var(--radius-lg);
                }

                .consent-checkbox label {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    cursor: pointer;
                }

                .consent-checkbox input[type='checkbox'] {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                    flex-shrink: 0;
                    margin-top: 0.125rem;
                }

                .consent-checkbox span {
                    line-height: 1.6;
                    color: var(--foreground);
                }

                .modal-actions {
                    text-align: center;
                    margin-bottom: 1rem;
                }

                .btn {
                    padding: 0.75rem 2rem;
                    border-radius: var(--radius-lg);
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    font-size: 1rem;
                }

                .btn-primary {
                    background: var(--primary-600);
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    background: var(--primary-700);
                }

                .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .modal-note {
                    font-size: 0.875rem;
                    color: var(--muted-foreground);
                    text-align: center;
                    font-style: italic;
                }

                @media (max-width: 640px) {
                    .modal-header h1 {
                        font-size: 1.5rem;
                    }

                    .modal-content {
                        padding: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
