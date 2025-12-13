'use client';

import Link from 'next/link';
import { ArrowLeft, Search, Book, HelpCircle, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const faqs = [
    { q: "Comment créer un compte ?", a: "Cliquez sur 'Commencer gratuitement' sur la page d'accueil, puis remplissez le formulaire avec votre email." },
    { q: "Comment passer le test de niveau ?", a: "Après inscription, accédez à votre tableau de bord et cliquez sur 'Passer le test'. Il dure environ 15 minutes." },
    { q: "Les cours sont-ils gratuits ?", a: "Oui ! La majorité des exercices et cours sont gratuits. Certaines fonctionnalités avancées nécessitent un abonnement." },
    { q: "Comment suivre ma progression ?", a: "Rendez-vous sur la page Progression pour voir vos statistiques, votre niveau et vos achievements." },
    { q: "Puis-je utiliser LexaFlow sur mobile ?", a: "Oui, notre site est entièrement responsive et fonctionne parfaitement sur tous les appareils." },
    { q: "Comment réinitialiser mon mot de passe ?", a: "Sur la page de connexion, cliquez sur 'Mot de passe oublié' et suivez les instructions envoyées par email." },
];

const categories = [
    { icon: <Book size={20} />, title: "Débuter", desc: "Premiers pas sur LexaFlow" },
    { icon: <HelpCircle size={20} />, title: "Compte", desc: "Gérer votre profil" },
    { icon: <MessageCircle size={20} />, title: "Support", desc: "Nous contacter" },
];

export default function HelpPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <main id="main-content" className="help-page">
            <div className="container">
                <Link href="/" className="back-link"><ArrowLeft size={20} />Retour</Link>
                <div className="page-header"><h1>Centre d'aide</h1><p>Comment pouvons-nous vous aider ?</p></div>

                <div className="search-box">
                    <Search size={20} />
                    <input type="text" placeholder="Rechercher une question..." />
                </div>

                <div className="categories-grid">
                    {categories.map((c, i) => (<div key={i} className="category-card"><div className="cat-icon">{c.icon}</div><h3>{c.title}</h3><p>{c.desc}</p></div>))}
                </div>

                <div className="faq-section">
                    <h2>Questions fréquentes</h2>
                    <div className="faq-list">
                        {faqs.map((faq, i) => (
                            <div key={i} className={`faq-item ${openIndex === i ? 'open' : ''}`}>
                                <button className="faq-question" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                                    <span>{faq.q}</span>
                                    {openIndex === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                {openIndex === i && <div className="faq-answer"><p>{faq.a}</p></div>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="contact-card">
                    <h3>Vous n'avez pas trouvé votre réponse ?</h3>
                    <p>Notre équipe est là pour vous aider</p>
                    <Link href="/contact" className="btn btn-primary">Nous contacter</Link>
                </div>
            </div>
            <style jsx>{`
        .help-page{min-height:100vh;padding:3rem 0;background:var(--background)}
        .back-link{display:inline-flex;align-items:center;gap:.5rem;color:var(--primary-600);margin-bottom:2rem;font-weight:500}
        .page-header{text-align:center;margin-bottom:2rem}
        .page-header h1{font-size:2.5rem;background:linear-gradient(135deg,var(--primary-600),var(--secondary-500));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .page-header p{color:var(--muted-foreground);font-size:1.125rem}
        .search-box{display:flex;align-items:center;gap:.75rem;max-width:500px;margin:0 auto 3rem;padding:1rem 1.5rem;background:var(--card);border-radius:var(--radius-full);box-shadow:var(--shadow-md)}
        .search-box svg{color:var(--muted-foreground)}
        .search-box input{flex:1;border:none;background:none;font-size:1rem;outline:none}
        .categories-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:3rem}
        .category-card{background:var(--card);padding:1.5rem;border-radius:var(--radius-xl);text-align:center;box-shadow:var(--shadow-sm);cursor:pointer;transition:transform .2s}
        .category-card:hover{transform:translateY(-2px)}
        .cat-icon{width:2.5rem;height:2.5rem;margin:0 auto .75rem;background:var(--primary-100);color:var(--primary-600);border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center}
        .category-card h3{font-size:1rem;margin-bottom:.25rem}
        .category-card p{font-size:.875rem;color:var(--muted-foreground)}
        .faq-section{max-width:700px;margin:0 auto 3rem}
        .faq-section h2{font-size:1.5rem;margin-bottom:1.5rem;text-align:center}
        .faq-list{display:flex;flex-direction:column;gap:.75rem}
        .faq-item{background:var(--card);border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-sm)}
        .faq-question{width:100%;display:flex;justify-content:space-between;align-items:center;padding:1rem 1.5rem;background:none;border:none;font-size:1rem;font-weight:500;text-align:left;cursor:pointer}
        .faq-question:hover{background:var(--muted)}
        .faq-answer{padding:0 1.5rem 1rem;color:var(--muted-foreground);line-height:1.6}
        .contact-card{text-align:center;padding:3rem;background:linear-gradient(135deg,var(--primary-600),var(--secondary-600));border-radius:var(--radius-xl);color:white;max-width:500px;margin:0 auto}
        .contact-card h3{color:white;margin-bottom:.5rem}
        .contact-card p{opacity:.9;margin-bottom:1.5rem}
      `}</style>
        </main>
    );
}
