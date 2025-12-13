'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuth';

const navLinks = [
    { href: '/exercises', label: 'Exercices' },
    { href: '/courses', label: 'Cours' },
    { href: '/progress', label: 'Progression' },
];

export default function Header() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuthStore();

    // Don't show header on auth pages
    if (pathname === '/login' || pathname === '/register') {
        return null;
    }

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
    };

    return (
        <header className="header">
            <div className="container header-container">
                <Link href="/" className="logo">
                    🎓 LexaFlow
                </Link>

                {/* Desktop Navigation */}
                <nav className="desktop-nav">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Auth Section */}
                <div className="auth-section">
                    {isAuthenticated && user ? (
                        <div className="user-menu-container">
                            <button
                                className="user-menu-trigger"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <div className="user-avatar">
                                    {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="user-name">{user.firstName || user.email?.split('@')[0] || 'User'}</span>
                                <ChevronDown size={16} />
                            </button>
                            {userMenuOpen && (
                                <div className="user-dropdown">
                                    <Link href="/dashboard" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                        <User size={16} />
                                        Mon tableau de bord
                                    </Link>
                                    <Link href="/progress" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                        Ma progression
                                    </Link>
                                    <div className="dropdown-divider" />
                                    <button className="dropdown-item logout" onClick={handleLogout}>
                                        <LogOut size={16} />
                                        Déconnexion
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link href="/login" className="btn btn-ghost">
                                Se connecter
                            </Link>
                            <Link href="/register" className="btn btn-primary">
                                S'inscrire
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="mobile-nav">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`mobile-nav-link ${pathname === link.href ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="mobile-nav-divider" />
                    {isAuthenticated ? (
                        <>
                            <Link href="/dashboard" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                                Mon tableau de bord
                            </Link>
                            <button className="mobile-nav-link logout" onClick={handleLogout}>
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                                Se connecter
                            </Link>
                            <Link href="/register" className="mobile-nav-link primary" onClick={() => setMobileMenuOpen(false)}>
                                S'inscrire
                            </Link>
                        </>
                    )}
                </div>
            )}

            <style jsx>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border);
        }

        :global([data-theme="dark"]) .header {
          background: rgba(15, 23, 42, 0.95);
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 4rem;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .desktop-nav {
          display: flex;
          gap: 2rem;
        }

        .nav-link {
          color: var(--muted-foreground);
          font-weight: 500;
          padding: 0.5rem 0;
          position: relative;
          transition: color 0.2s;
        }

        .nav-link:hover,
        .nav-link.active {
          color: var(--foreground);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -0.25rem;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--primary-600);
          border-radius: 1px;
        }

        .auth-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .auth-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .btn-ghost {
          background: transparent;
          color: var(--foreground);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-lg);
          font-weight: 500;
        }

        .btn-ghost:hover {
          background: var(--muted);
        }

        .user-menu-container {
          position: relative;
        }

        .user-menu-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: var(--radius-lg);
          transition: background 0.2s;
        }

        .user-menu-trigger:hover {
          background: var(--muted);
        }

        .user-avatar {
          width: 2rem;
          height: 2rem;
          background: linear-gradient(135deg, var(--primary-600), var(--secondary-500));
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .user-name {
          font-weight: 500;
          color: var(--foreground);
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          min-width: 200px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          text-align: left;
          color: var(--foreground);
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dropdown-item:hover {
          background: var(--muted);
        }

        .dropdown-item.logout {
          color: var(--error-600);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border);
          margin: 0.25rem 0;
        }

        .mobile-menu-toggle {
          display: none;
          padding: 0.5rem;
          background: none;
          border: none;
          color: var(--foreground);
          cursor: pointer;
        }

        .mobile-nav {
          display: none;
          padding: 1rem;
          background: var(--card);
          border-top: 1px solid var(--border);
        }

        .mobile-nav-link {
          display: block;
          width: 100%;
          padding: 0.75rem 1rem;
          color: var(--foreground);
          font-weight: 500;
          border-radius: var(--radius-lg);
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          background: var(--muted);
        }

        .mobile-nav-link.primary {
          background: var(--primary-600);
          color: white;
          margin-top: 0.5rem;
        }

        .mobile-nav-link.logout {
          color: var(--error-600);
        }

        .mobile-nav-divider {
          height: 1px;
          background: var(--border);
          margin: 0.75rem 0;
        }

        @media (max-width: 768px) {
          .desktop-nav,
          .auth-buttons,
          .user-name {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .mobile-nav {
            display: block;
          }
        }
      `}</style>
        </header>
    );
}
