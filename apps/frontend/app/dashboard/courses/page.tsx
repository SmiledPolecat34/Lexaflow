'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Play, Trophy, TrendingUp } from 'lucide-react';
import { coursesApi } from '@/lib/api';

export default function DashboardCoursesPage() {
    const { data: courses, isLoading } = useQuery({
        queryKey: ['user-courses'],
        queryFn: async () => {
            const response = await coursesApi.getAll();
            return response.data || [];
        },
    });

    const { data: recommendations } = useQuery({
        queryKey: ['course-recommendations'],
        queryFn: async () => {
            const response = await coursesApi.getRecommendations();
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <main className="dashboard-courses-page">
                <div className="container">
                    <div className="loading">Chargement des cours...</div>
                </div>
                <style jsx>{`
                    .dashboard-courses-page { padding: 2rem 0; }
                    .loading { text-align: center; padding: 4rem; color: var(--muted-foreground); }
                `}</style>
            </main>
        );
    }

    return (
        <main className="dashboard-courses-page">
            <div className="container">
                <div className="page-header">
                    <h1>Mes Cours</h1>
                    <p>Suivez vos cours et découvrez-en de nouveaux</p>
                </div>

                {courses && courses.length > 0 && (
                    <section className="my-courses">
                        <h2>En cours</h2>
                        <div className="courses-grid">
                            {courses.map((course: any) => (
                                <Link key={course.id} href={`/courses/${course.type}/${course.id}`} className="course-card">
                                    <div className="course-icon">
                                        <BookOpen size={32} />
                                    </div>
                                    <h3>{course.title}</h3>
                                    <p>{course.description}</p>
                                    <div className="course-meta">
                                        <span className="level-badge">{course.level}</span>
                                        <span className="lessons">{course.lessonCount} leçons</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: '0%' }}></div>
                                    </div>
                                    <span className="progress-text">0% complété</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {recommendations && recommendations.recommendations && (
                    <section className="recommendations">
                        <h2>Recommandés pour vous</h2>
                        <div className="courses-grid">
                            {recommendations.recommendations.slice(0, 3).map((course: any) => (
                                <Link key={course.id} href={`/courses/${course.type}/${course.id}`} className="course-card">
                                    <div className="course-icon recommended">
                                        <Trophy size={32} />
                                    </div>
                                    <h3>{course.title}</h3>
                                    <p>{course.description}</p>
                                    <div className="course-meta">
                                        <span className="level-badge">{course.level}</span>
                                        <span className="lessons">{course.lessonCount} leçons</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {recommendations && recommendations.weakAreas && recommendations.weakAreas.length > 0 && (
                    <section className="weak-areas">
                        <h2>Domaines à améliorer</h2>
                        <div className="weak-areas-grid">
                            {recommendations.weakAreas.map((area: any, index: number) => (
                                <div key={index} className="weak-area-card">
                                    <TrendingUp size={24} />
                                    <div>
                                        <h4>{area.type}</h4>
                                        <p>Score moyen : {area.avgScore}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <style jsx>{`
                .dashboard-courses-page { padding: 2rem 0; }
                .page-header { margin-bottom: 2.5rem; }
                .page-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
                .page-header p { color: var(--muted-foreground); }
                section { margin-bottom: 3rem; }
                h2 { font-size: 1.5rem; margin-bottom: 1.5rem; }
                .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
                .course-card { background: var(--card); padding: 1.5rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); transition: all 0.2s; }
                .course-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
                .course-icon { width: 4rem; height: 4rem; display: flex; align-items: center; justify-content: center; background: var(--primary-100); color: var(--primary-600); border-radius: var(--radius-lg); margin-bottom: 1rem; }
                .course-icon.recommended { background: #fef3c7; color: #f59e0b; }
                .course-card h3 { font-size: 1.125rem; margin-bottom: 0.5rem; }
                .course-card p { font-size: 0.875rem; color: var(--muted-foreground); margin-bottom: 1rem; }
                .course-meta { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
                .level-badge { padding: 0.25rem 0.75rem; background: var(--primary-100); color: var(--primary-700); border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; }
                .lessons { font-size: 0.75rem; color: var(--muted-foreground); }
                .progress-bar { height: 6px; background: var(--muted); border-radius: var(--radius-full); overflow: hidden; margin-bottom: 0.5rem; }
                .progress-fill { height: 100%; background: var(--primary-600); border-radius: var(--radius-full); }
                .progress-text { font-size: 0.75rem; color: var(--muted-foreground); }
                .weak-areas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
                .weak-area-card { background: #fef3c7; padding: 1rem; border-radius: var(--radius-lg); display: flex; align-items: center; gap: 1rem; }
                .weak-area-card h4 { font-size: 1rem; margin-bottom: 0.25rem; }
                .weak-area-card p { font-size: 0.875rem; color: var(--muted-foreground); }
            `}</style>
        </main>
    );
}
