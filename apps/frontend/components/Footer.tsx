'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const footerLinks = {
  product: [
    { href: '/exercises', label: 'Exercices' },
    { href: '/courses', label: 'Cours' },
    { href: '/progress', label: 'Progression' },
  ],
  company: [
    { href: '/about', label: 'À propos' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' },
  ],
  legal: [
    { href: '/privacy', label: 'Politique de confidentialité' },
    { href: '/terms', label: 'Conditions d\'utilisation' },
    { href: '/cookies', label: 'Cookies' },
  ],
};

const socialLinks = [
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-container">
        {/* Main Footer Content */}
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              🎓 LexaFlow
            </Link>
            <p className="footer-tagline">
              Maîtrisez l'anglais avec des exercices interactifs et des leçons générées par l'IA
            </p>
            <div className="social-links">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div className="footer-section">
            <h3>Produit</h3>
            <ul>
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="footer-section">
            <h3>Entreprise</h3>
            <ul>
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-section">
            <h3>Légal</h3>
            <ul>
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3>Contact</h3>
            <ul className="contact-list">
              <li>
                <Mail size={16} />
                <a href="mailto:contact@lexaflow.com">contact@lexaflow.com</a>
              </li>
              <li>
                <Phone size={16} />
                <a href="tel:+33123456789">+33 1 23 45 67 89</a>
              </li>
              <li>
                <MapPin size={16} />
                <span>Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} LexaFlow. Tous droits réservés.
          </p>
          <div className="footer-bottom-links">
            <Link href="/privacy">Vie privée</Link>
            <Link href="/terms">Conditions</Link>
            <Link href="/sitemap">Plan du site</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: linear-gradient(to bottom, var(--background), var(--muted));
          border-top: 1px solid var(--border);
          margin-top: auto;
          padding: 4rem 0 2rem;
        }

        :global([data-theme="dark"]) .footer {
          background: linear-gradient(to bottom, #0f172a, #1e293b);
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr repeat(4, 1fr);
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-brand {
          max-width: 300px;
        }

        .footer-logo {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--foreground);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          transition: opacity 0.2s;
        }

        .footer-logo:hover {
          opacity: 0.8;
        }

        .footer-tagline {
          color: var(--muted-foreground);
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-size: 0.9375rem;
        }

        .social-links {
          display: flex;
          gap: 0.75rem;
        }

        .social-link {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          color: var(--muted-foreground);
          transition: all 0.2s;
        }

        .social-link:hover {
          background: var(--primary-600);
          border-color: var(--primary-600);
          color: white;
          transform: translateY(-2px);
        }

        .footer-section h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          color: var(--foreground);
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section li {
          margin-bottom: 0.75rem;
        }

        .footer-section a,
        .footer-section span {
          color: var(--muted-foreground);
          font-size: 0.9375rem;
          transition: color 0.2s;
        }

        .footer-section a:hover {
          color: var(--primary-600);
        }

        .contact-list li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .contact-list svg {
          color: var(--primary-600);
          flex-shrink: 0;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
        }

        .copyright {
          color: var(--muted-foreground);
          font-size: 0.875rem;
        }

        .footer-bottom-links {
          display: flex;
          gap: 1.5rem;
        }

        .footer-bottom-links a {
          color: var(--muted-foreground);
          font-size: 0.875rem;
          transition: color 0.2s;
        }

        .footer-bottom-links a:hover {
          color: var(--primary-600);
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 2fr 1fr 1fr;
            gap: 2rem;
          }

          .footer-section:nth-child(4),
          .footer-section:nth-child(5) {
            grid-column: span 1;
          }
        }

        @media (max-width: 768px) {
          .footer {
            padding: 3rem 0 1.5rem;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }

          .footer-brand {
            max-width: 100%;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .footer-bottom-links {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
}
