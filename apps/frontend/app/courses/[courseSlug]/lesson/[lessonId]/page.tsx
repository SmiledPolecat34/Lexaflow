'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, CheckCircle } from 'lucide-react';
import { coursesApi } from '@/lib/api';

interface LessonContent {
  title: string;
  introduction: string;
  sections: {
    title: string;
    content: string;
    examples: { english: string; french: string; explanation?: string }[];
  }[];
  summary: string;
  keyPoints?: string[];
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.courseSlug as string;
  const lessonId = parseInt(params.lessonId as string);

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<LessonContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Course data mapping
  const courseData: Record<string, { title: string; lessons: { id: number; title: string }[]; level: string }> = {
    'verb-tenses': {
      title: 'Les temps verbaux',
      level: 'A2',
      lessons: [
        { id: 1, title: "Le présent simple (révision)" },
        { id: 2, title: "Le présent continu (be + -ing)" },
        { id: 3, title: "Présent simple vs continu" },
      ]
    },
    'vocabulary': {
      title: 'Vocabulaire du quotidien',
      level: 'A1',
      lessons: [
        { id: 1, title: "Se présenter et saluer" },
        { id: 2, title: "Les nombres et l'heure" },
        { id: 3, title: "La famille et les relations" },
      ]
    }
  };

  const course = courseData[courseSlug];
  const lesson = course?.lessons.find(l => l.id === lessonId);
  const lessonIndex = course?.lessons.findIndex(l => l.id === lessonId) ?? -1;

  useEffect(() => {
    async function loadLesson() {
      if (!lesson) {
        setError('Leçon introuvable');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Call backend to generate lesson content
        const response = await coursesApi.generateContent({
          topic: lesson.title,
          level: course.level,
          type: 'GRAMMAR'
        });

        if (response.data) {
          setContent(response.data as LessonContent);
        } else {
          setError(response.error || 'Erreur lors du chargement');
        }
      } catch (err) {
        console.error('Error loading lesson:', err);
        setError('Erreur lors du chargement de la leçon');
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [courseSlug, lessonId]);

  if (loading) {
    return (
      <main className="lesson-page">
        <div className="container">
          <div className="loading-state">
            <Loader2 size={48} className="spinner" />
            <p>Chargement de la leçon...</p>
          </div>
        </div>
        <style jsx>{styles}</style>
      </main>
    );
  }

  if (error || !content) {
    return (
      <main className="lesson-page">
        <div className="container">
          <Link href={`/courses/${courseSlug}`} className="back-link">
            <ArrowLeft size={20} />Retour au cours
          </Link>
          <div className="error-state">
            <p>{error || 'Contenu introuvable'}</p>
          </div>
        </div>
        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="lesson-page">
      <div className="container">
        <Link href={`/courses/${courseSlug}`} className="back-link">
          <ArrowLeft size={20} />Retour au cours
        </Link>

        <div className="lesson-header">
          <span className="lesson-badge">{course.level}</span>
          <h1>{content.title}</h1>
          <p className="lesson-intro">{content.introduction}</p>
        </div>

        <div className="lesson-content">
          {content.sections.map((section, idx) => (
            <section key={idx} className="content-section">
              <h2>{section.title}</h2>
              <div className="section-content" dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br/>') }} />
              
              {section.examples.length > 0 && (
                <div className="examples">
                  <h3>Exemples :</h3>
                  {section.examples.map((example, i) => (
                    <div key={i} className="example-card">
                      <p className="example-en">🇬🇧 {example.english}</p>
                      <p className="example-fr">🇫🇷 {example.french}</p>
                      {example.explanation && <p className="example-exp">{example.explanation}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          <div className="lesson-summary">
            <h2>Résumé</h2>
            <p>{content.summary}</p>
            {content.keyPoints && content.keyPoints.length > 0 && (
              <div className="key-points">
                <h3>Points clés :</h3>
                <ul>
                  {content.keyPoints.map((point, i) => (
                    <li key={i}>
                      <CheckCircle size={20} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="lesson-navigation">
          {lessonIndex > 0 && (
            <Link href={`/courses/${courseSlug}/lesson/${course.lessons[lessonIndex - 1].id}`} className="nav-btn prev">
              <ChevronLeft size={20} />
              <span>Leçon précédente</span>
            </Link>
          )}
          {lessonIndex < course.lessons.length - 1 && (
            <Link href={`/courses/${courseSlug}/lesson/${course.lessons[lessonIndex + 1].id}`} className="nav-btn next">
              <span>Leçon suivante</span>
              <ChevronRight size={20} />
            </Link>
          )}
        </div>
      </div>
      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  .lesson-page { min-height: 100vh; padding: 3rem 0; background: var(--background); }
  .container { max-width: 800px; margin: 0 auto; padding: 0 1rem; }
  .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--primary-600); margin-bottom: 2rem; font-weight: 500; }
  .lesson-header { margin-bottom: 3rem; }
  .lesson-badge { display: inline-block; padding: 0.25rem 0.75rem; background: var(--primary-600); color: white; border-radius: var(--radius-full); font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; }
  .lesson-header h1 { font-size: 2.5rem; margin-bottom: 1rem; }
  .lesson-intro { font-size: 1.125rem; color: var(--muted-foreground); line-height: 1.6; }
  
  .content-section { margin-bottom: 3rem; }
  .content-section h2 { font-size: 1.75rem; margin-bottom: 1rem; color: var(--primary-600); }
  .section-content { font-size: 1.0625rem; line-height: 1.8; color: var(--foreground); margin-bottom: 2rem; }
  
  .examples { background: var(--muted); padding: 1.5rem; border-radius: var(--radius-lg); margin-top: 2rem; }
  .examples h3 { font-size: 1.125rem; margin-bottom: 1rem; }
  .example-card { background: var(--card); padding: 1rem; border-radius: var(--radius-lg); margin-bottom: 1rem; border-left: 4px solid var(--primary-600); }
  .example-card:last-child { margin-bottom: 0; }
  .example-en { font-weight: 600; margin-bottom: 0.5rem; }
  .example-fr { color: var(--muted-foreground); margin-bottom: 0.25rem; }
  .example-exp { font-size: 0.875rem; color: var(--muted-foreground); font-style: italic; margin-top: 0.5rem; }
  
  .lesson-summary { background: linear-gradient(135deg, var(--primary-50), var(--secondary-50)); padding: 2rem; border-radius: var(--radius-xl); margin-top: 3rem; }
  .lesson-summary h2 { font-size: 1.5rem; margin-bottom: 1rem; }
  .lesson-summary p { line-height: 1.7; margin-bottom: 1.5rem; }
  
  .key-points h3 { font-size: 1.125rem; margin-bottom: 1rem; }
  .key-points ul { list-style: none; padding: 0; }
  .key-points li { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; }
  .key-points li svg { color: var(--primary-600); flex-shrink: 0; margin-top: 0.25rem; }
  
  .lesson-navigation { display: flex; justify-content: space-between; margin-top: 3rem; padding-top: 2rem; border-top: 2px solid var(--border); }
  .nav-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: var(--primary-600); color: white; border-radius: var(--radius-lg); font-weight: 600; transition: background 0.2s; }
  .nav-btn:hover { background: var(--primary-700); }
  .nav-btn.next { margin-left: auto; }
  
  .loading-state, .error-state { text-align: center; padding: 4rem 2rem; }
  .spinner { animation: spin 1s linear infinite; color: var(--primary-600); margin: 0 auto 1rem; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  
  @media (max-width: 768px) {
    .lesson-header h1 { font-size: 2rem; }
    .lesson-navigation { flex-direction: column; gap: 1rem; }
    .nav-btn.next { margin-left: 0; }
  }
`;
