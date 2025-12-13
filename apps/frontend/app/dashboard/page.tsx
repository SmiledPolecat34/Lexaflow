'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Dumbbell,
  BookOpen,
  Trophy,
  Flame,
  TrendingUp,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { userApi, coursesApi } from '@/lib/api';
import { useAuthStore } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: progress } = useQuery({
    queryKey: ['user', 'progress'],
    queryFn: async () => {
      const { data, error } = await userApi.getProgress();
      if (error) throw new Error(error);
      return data;
    },
  });

  const { data: recommendations } = useQuery({
    queryKey: ['courses', 'recommendations'],
    queryFn: async () => {
      const { data, error } = await coursesApi.getRecommendations();
      if (error) throw new Error(error);
      return data;
    },
  });

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <section className="welcome animate-slideUp">
        <div className="welcome-content">
          <h1>
            Bonjour, {user?.firstName || 'Apprenant'} ! 👋
          </h1>
          <p>Continuez votre apprentissage et atteignez vos objectifs.</p>
        </div>
        <div className="streak-display">
          <Flame className="streak-icon" size={32} />
          <div className="streak-info">
            <span className="streak-count">{progress?.streak?.currentStreak || 0}</span>
            <span className="streak-label">jours de suite</span>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="stats-grid">
        <StatCard
          icon={<Dumbbell />}
          label="Exercices terminés"
          value={progress?.summary?.totalExercises || 0}
          color="primary"
        />
        <StatCard
          icon={<TrendingUp />}
          label="Score moyen"
          value={`${Math.round(progress?.summary?.averageScore || 0)}%`}
          color="success"
        />
        <StatCard
          icon={<BookOpen />}
          label="Cours en cours"
          value={progress?.summary?.coursesInProgress || 0}
          color="secondary"
        />
        <StatCard
          icon={<Trophy />}
          label="Badges gagnés"
          value={progress?.summary?.badgesEarned || 0}
          color="warning"
        />
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Actions rapides</h2>
        <div className="actions-grid">
          <Link href="/dashboard/exercises" className="action-card">
            <div className="action-icon primary">
              <Dumbbell size={24} />
            </div>
            <div className="action-content">
              <h3>Nouvel exercice</h3>
              <p>Pratiquez avec l'IA</p>
            </div>
            <ChevronRight size={20} />
          </Link>
          <Link href="/dashboard/courses" className="action-card">
            <div className="action-icon secondary">
              <BookOpen size={24} />
            </div>
            <div className="action-content">
              <h3>Continuer un cours</h3>
              <p>Reprenez où vous étiez</p>
            </div>
            <ChevronRight size={20} />
          </Link>
          <Link href="/dashboard/placement-test" className="action-card">
            <div className="action-icon warning">
              <Zap size={24} />
            </div>
            <div className="action-content">
              <h3>Test de niveau</h3>
              <p>Évaluez votre niveau</p>
            </div>
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Recommendations */}
      {recommendations?.recommendations && recommendations.recommendations.length > 0 && (
        <section className="recommendations">
          <h2>Recommandé pour vous</h2>
          <div className="course-cards">
            {recommendations.recommendations.slice(0, 3).map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.id}`}
                className="course-card"
              >
                <div className="course-header">
                  <span className="badge badge-level">{course.level}</span>
                  <span className="course-type">{course.type}</span>
                </div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-footer">
                  <span>{course.lessonCount} leçons</span>
                  <span>{course.duration} min</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Weak Areas */}
      {recommendations?.weakAreas && recommendations.weakAreas.length > 0 && (
        <section className="weak-areas">
          <h2>Points à améliorer</h2>
          <div className="weak-cards">
            {recommendations.weakAreas.map((area) => (
              <div key={area.type} className="weak-card">
                <div className="weak-info">
                  <span className="weak-type">{area.type.replace('_', ' ')}</span>
                  <span className="weak-score">{Math.round(area.avgScore)}%</span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${area.avgScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <style jsx>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
        }

        .welcome {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
          color: white;
          padding: 2rem;
          border-radius: var(--radius-2xl);
          margin-bottom: 2rem;
        }

        .welcome h1 {
          color: white;
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }

        .welcome p {
          opacity: 0.9;
          margin: 0;
        }

        .streak-display {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 1rem 1.5rem;
          border-radius: var(--radius-xl);
        }

        .streak-icon {
          color: #fbbf24;
        }

        .streak-info {
          display: flex;
          flex-direction: column;
        }

        .streak-count {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .streak-label {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          transition: all 0.2s;
          text-decoration: none;
        }

        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary-300);
        }

        .action-icon {
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
        }

        .action-icon.primary {
          background: var(--primary-100);
          color: var(--primary-600);
        }

        .action-icon.secondary {
          background: var(--secondary-100);
          color: var(--secondary-600);
        }

        .action-icon.warning {
          background: var(--warning-100);
          color: var(--warning-600);
        }

        .action-content {
          flex: 1;
        }

        .action-content h3 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
          color: var(--foreground);
        }

        .action-content p {
          font-size: 0.875rem;
          color: var(--muted-foreground);
          margin: 0;
        }

        .course-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .course-card {
          padding: 1.5rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          transition: all 0.2s;
          text-decoration: none;
        }

        .course-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .course-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .course-type {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--muted-foreground);
        }

        .course-card h3 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }

        .course-card p {
          font-size: 0.875rem;
          color: var(--muted-foreground);
          margin-bottom: 1rem;
        }

        .course-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }

        .weak-cards {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .weak-card {
          padding: 1rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }

        .weak-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .weak-type {
          text-transform: capitalize;
          font-weight: 500;
        }

        .weak-score {
          color: var(--warning-600);
          font-weight: 600;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .actions-grid,
          .course-cards {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .welcome {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: 'primary' | 'secondary' | 'success' | 'warning';
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>

      <style jsx>{`
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
        }

        .stat-icon {
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
        }

        .stat-icon.primary {
          background: var(--primary-100);
          color: var(--primary-600);
        }

        .stat-icon.secondary {
          background: var(--secondary-100);
          color: var(--secondary-600);
        }

        .stat-icon.success {
          background: var(--success-100);
          color: var(--success-600);
        }

        .stat-icon.warning {
          background: var(--warning-100);
          color: var(--warning-600);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--muted-foreground);
        }
      `}</style>
    </div>
  );
}
