'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, Send, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Message envoyé ! Nous vous répondrons bientôt.');
    };

    return (
        <main id="main-content" className="contact-page">
            <div className="container">
                <Link href="/" className="back-link"><ArrowLeft size={20} />Retour</Link>
                <div className="page-header"><h1>Contactez-nous</h1><p>Une question ? Nous sommes là pour vous aider</p></div>

                <div className="contact-grid">
                    <div className="contact-info">
                        <h2>Informations</h2>
                        <div className="info-item"><div className="info-icon"><Mail size={20} /></div><div><h4>Email</h4><a href="mailto:versayo03@gmail.com">versayo03@gmail.com</a></div></div>
                        <div className="info-item"><div className="info-icon"><Clock size={20} /></div><div><h4>Temps de réponse</h4><p>Sous 24-48h</p></div></div>
                        <div className="info-item"><div className="info-icon"><MapPin size={20} /></div><div><h4>Localisation</h4><p>France</p></div></div>
                        <div className="faq-link"><p>Consultez d'abord notre <Link href="/help">centre d'aide</Link></p></div>
                    </div>

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <h2>Envoyez-nous un message</h2>
                        <div className="form-row">
                            <div className="form-group"><label>Nom</label><input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Votre nom" /></div>
                            <div className="form-group"><label>Email</label><input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="votre@email.com" /></div>
                        </div>
                        <div className="form-group"><label>Sujet</label>
                            <select value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required>
                                <option value="">Sélectionnez un sujet</option>
                                <option value="question">Question générale</option>
                                <option value="bug">Signaler un bug</option>
                                <option value="suggestion">Suggestion</option>
                                <option value="gdpr">Demande RGPD</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>
                        <div className="form-group"><label>Message</label><textarea rows={5} required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} placeholder="Décrivez votre demande..."></textarea></div>
                        <button type="submit" className="btn btn-primary btn-submit"><Send size={18} />Envoyer</button>
                    </form>
                </div>
            </div>
            <style jsx>{`
        .contact-page{min-height:100vh;padding:3rem 0;background:var(--background)}
        .back-link{display:inline-flex;align-items:center;gap:.5rem;color:var(--primary-600);margin-bottom:2rem;font-weight:500}
        .page-header{text-align:center;margin-bottom:3rem}
        .page-header h1{font-size:2.5rem;background:linear-gradient(135deg,var(--primary-600),var(--secondary-500));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .page-header p{color:var(--muted-foreground);font-size:1.125rem}
        .contact-grid{display:grid;grid-template-columns:1fr 2fr;gap:3rem;max-width:1000px;margin:0 auto}
        .contact-info{background:var(--card);padding:2rem;border-radius:var(--radius-xl);box-shadow:var(--shadow-md)}
        .contact-info h2{font-size:1.25rem;margin-bottom:1.5rem}
        .info-item{display:flex;gap:1rem;margin-bottom:1.5rem}
        .info-icon{width:2.5rem;height:2.5rem;background:var(--primary-100);color:var(--primary-600);border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .info-item h4{font-size:.875rem;margin-bottom:.25rem}
        .info-item p,.info-item a{font-size:.875rem;color:var(--muted-foreground)}
        .info-item a{color:var(--primary-600)}
        .faq-link{margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--border)}
        .faq-link p{font-size:.9rem;color:var(--muted-foreground)}
        .faq-link a{color:var(--primary-600);font-weight:500}
        .contact-form{background:var(--card);padding:2rem;border-radius:var(--radius-xl);box-shadow:var(--shadow-md)}
        .contact-form h2{font-size:1.25rem;margin-bottom:1.5rem}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .form-group{margin-bottom:1rem}
        .form-group label{display:block;font-size:.875rem;font-weight:500;margin-bottom:.5rem}
        .form-group input,.form-group select,.form-group textarea{width:100%;padding:.75rem 1rem;border:1px solid var(--border);border-radius:var(--radius-lg);font-size:1rem;background:var(--background);transition:border-color .2s}
        .form-group input:focus,.form-group select:focus,.form-group textarea:focus{outline:none;border-color:var(--primary-600)}
        .btn-submit{width:100%;display:flex;align-items:center;justify-content:center;gap:.5rem;padding:1rem;margin-top:.5rem}
        @media(max-width:768px){.contact-grid{grid-template-columns:1fr}.form-row{grid-template-columns:1fr}}
      `}</style>
        </main>
    );
}
