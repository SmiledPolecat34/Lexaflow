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
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.05),
            0 4px 20px rgba(0, 0, 0, 0.03),
            inset 0 -1px 0 0 rgba(255, 255, 255, 0.8);
        }

        :global([data-theme="dark"]) .header {
          background: rgba(15, 23, 42, 0.85);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.3), 
            0 4px 20px rgba(0, 0, 0, 0.2),
            inset 0 -1px 0 0 rgba(255, 255, 255, 0.05);
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 4.5rem;
          padding: 0 2rem;
          position: relative;
        }

        .header-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 95%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(99, 102, 241, 0.4) 20%,
            rgba(139, 92, 246, 0.4) 50%,
            rgba(236, 72, 153, 0.4) 80%,
            transparent
          );
          opacity: 0.6;
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }

        .logo {
          font-size: 1.875rem;
          font-weight: 900;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.2));
        }

        .logo:hover {
          transform: scale(1.05);
          filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3));
        }

        .desktop-nav {
          display: flex;
          gap: 0.375rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
          padding: 0.5rem;
          border-radius: var(--radius-full);
          box-shadow: 
            inset 0 1px 1px rgba(255, 255, 255, 0.8),
            0 2px 8px rgba(99, 102, 241, 0.08),
            0 1px 2px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.1);
        }

        :global([data-theme="dark"]) .desktop-nav {
          background: linear-gradient(135deg, rgba(51, 65, 85, 0.9), rgba(51, 65, 85, 0.7));
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .nav-link {
          color: var(--muted-foreground);
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: var(--radius-full);
          font-size: 0.9375rem;
          letter-spacing: -0.01em;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
          opacity: 0;
          transition: opacity 0.3s;
        }

        .nav-link:hover {
          color: var(--foreground);
        }

        .nav-link:hover::before {
          opacity: 1;
        }

        :global([data-theme="dark"]) .nav-link:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-link.active {
          color: white;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          box-shadow: 
            0 4px 14px rgba(99, 102, 241, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          position: relative;
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          opacity: 0.3;
          filter: blur(8px);
          z-index: -1;
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
          padding: 0.625rem 1.25rem;
          border-radius: var(--radius-full);
          font-weight: 600;
          transition: all 0.2s;
          border: 2px solid transparent;
        }

        .btn-ghost:hover {
          background: var(--muted);
          border-color: var(--border);
        }

        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 0.625rem 1.5rem;
          border-radius: var(--radius-full);
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
          transition: all 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
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
