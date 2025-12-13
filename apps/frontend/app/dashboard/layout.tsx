'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Dumbbell,
  BarChart3,
  Settings,
  Trophy,
  LogOut,
  User,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: Home },
  { href: '/dashboard/exercises', label: 'Exercices', icon: Dumbbell },
  { href: '/dashboard/courses', label: 'Cours', icon: BookOpen },
  { href: '/dashboard/progress', label: 'Progression', icon: BarChart3 },
  { href: '/dashboard/badges', label: 'Badges', icon: Trophy },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useRequireAuth();
  const { logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Chargement...</p>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button
          className="menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="mobile-logo">🎓 LexaFlow</span>
        <div className="mobile-user">
          <span className="badge badge-level">{user?.level}</span>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-logo">
            🎓 LexaFlow
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className={`sidebar-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
            >
              <Shield size={20} />
              <span>Administration</span>
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-details">
              <span className="user-name">
                {user?.firstName || user?.email?.split('@')[0]}
              </span>
              <span className="user-level badge badge-level">
                Niveau {user?.level}
              </span>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="main-content" id="main-content">
        {children}
      </main>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }

        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 4rem;
          background: var(--card);
          border-bottom: 1px solid var(--border);
          padding: 0 1rem;
          align-items: center;
          justify-content: space-between;
          z-index: 100;
        }

        .menu-btn {
          background: none;
          border: none;
          color: var(--foreground);
          cursor: pointer;
          padding: 0.5rem;
        }

        .mobile-logo {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .sidebar {
          width: 280px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background: var(--card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 150;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .sidebar-logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-lg);
          color: var(--muted-foreground);
          font-weight: 500;
          transition: all 0.15s;
          margin-bottom: 0.25rem;
        }

        .sidebar-link:hover {
          background: var(--muted);
          color: var(--foreground);
          text-decoration: none;
        }

        .sidebar-link.active {
          background: var(--primary-100);
          color: var(--primary-700);
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--border);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .user-avatar {
          width: 2.5rem;
          height: 2.5rem;
          background: var(--primary-100);
          color: var(--primary-600);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 500;
          font-size: 0.875rem;
        }

        .user-level {
          font-size: 0.75rem;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          color: var(--muted-foreground);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .logout-btn:hover {
          background: var(--error-100);
          border-color: var(--error-200);
          color: var(--error-700);
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 140;
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          padding: 2rem;
          min-height: 100vh;
          background: var(--background);
        }

        @media (max-width: 768px) {
          .mobile-header {
            display: flex;
          }

          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .sidebar-overlay {
            display: block;
          }

          .main-content {
            margin-left: 0;
            padding-top: 5rem;
          }
        }
      `}</style>
    </div>
  );
}
