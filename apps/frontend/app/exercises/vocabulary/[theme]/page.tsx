'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Loader2, Trophy } from 'lucide-react';
import { exercisesApi, type Exercise, type ExerciseResult } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useAuth';

export default function ExerciseGenerationPage() {
    const { user, isLoading: authLoading } = useRequireAuth();
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const theme = params.theme as string;
    const level = searchParams.get('level') || 'A2';
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [exercise, setExercise] = useState<(Exercise & { exerciseId: string }) | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<ExerciseResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [startTime] = useState(Date.now());

    // Don't load exercise if still checking auth
    if (authLoading) {
        return (
            <main className="exercise-page">
                <div className="container">
                    <div className="loading-state">
                        <Loader2 size={48} className="spinner" />
                        <p>Chargement...</p>
                    </div>
                </div>
                <style jsx>{`
                    .exercise-page { min-height: 100vh; padding: 3rem 0; background: linear-gradient(135deg, #dcfce7 0%, var(--background) 50%); }
                    .loading-state { text-align: center; padding: 4rem; }
                    .spinner { animation: spin 1s linear infinite; color: #22c55e; margin: 0 auto 1rem; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </main>
        );
    }

    useEffect(() => {
        async function generateExercise() {
            try {
                setLoading(true);
                const response = await exercisesApi.generate({
                    type: 'VOCABULARY',
                    level: level,
                    theme: theme,
                    count: 10,
                });

                if (response.data) {
                    setExercise(response.data);
                } else {
                    setError(response.error || 'Failed to generate exercise');
                }
            } catch (err) {
                console.error('Error generating exercise:', err);
                setError('Failed to generate exercise');
            } finally {
                setLoading(false);
            }
        }

        generateExercise();
    }, [theme, level]);

    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        if (!exercise) return;

        try {
            setSubmitting(true);
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            
            const answersList = exercise.content.questions.map(q => ({
                questionId: q.id,
                answer: answers[q.id] || '',
            }));

            const response = await exercisesApi.submit(
                exercise.exerciseId,
                answersList,
                timeSpent
            );

            if (response.data) {
                setResult(response.data);
            } else {
                setError(response.error || 'Failed to submit exercise');
            }
        } catch (err) {
            console.error('Error submitting exercise:', err);
            setError('Failed to submit exercise');
        } finally {
            setSubmitting(false);
        }
    };

    const currentQuestion = exercise?.content.questions[currentQuestionIndex];
    const totalQuestions = exercise?.content.questions.length || 0;
    const answeredCount = Object.keys(answers).length;

    if (loading) {
        return (
            <main className="exercise-page">
                <div className="container">
                    <div className="loading-state">
                        <Loader2 size={48} className="spinner" />
                        <p>Génération de l&apos;exercice...</p>
                    </div>
                </div>
                <style jsx>{`
                    .exercise-page { min-height: 100vh; padding: 3rem 0; background: linear-gradient(135deg, #dcfce7 0%, var(--background) 50%); }
                    .loading-state { text-align: center; padding: 4rem; }
                    .spinner { animation: spin 1s linear infinite; color: #22c55e; margin: 0 auto 1rem; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </main>
        );
    }

    if (error || !exercise) {
        return (
            <main className="exercise-page">
                <div className="container">
                    <Link href={`/exercises/vocabulary`} className="back-link">
                        <ArrowLeft size={20} />
                        Retour
                    </Link>
                    <div className="error-state">
                        <p>{error || 'Exercise not found'}</p>
                        <button onClick={() => router.back()} className="btn btn-primary">
                            Réessayer
                        </button>
                    </div>
                </div>
                <style jsx>{`
                    .exercise-page { min-height: 100vh; padding: 3rem 0; background: linear-gradient(135deg, #dcfce7 0%, var(--background) 50%); }
                    .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--primary-600); margin-bottom: 2rem; font-weight: 500; }
                    .error-state { text-align: center; padding: 4rem; color: var(--muted-foreground); }
                `}</style>
            </main>
        );
    }

    if (result) {
        return (
            <main className="exercise-page">
                <div className="container">
                    <div className="result-card">
                        <Trophy size={64} className={result.passed ? 'trophy-success' : 'trophy-fail'} />
                        <h1>{result.passed ? 'Excellent travail !' : 'Bon effort !'}</h1>
                        <div className="score-display">
                            <div className="score-value">{result.percentage}%</div>
                            <div className="score-label">{result.score} / {result.maxScore} points</div>
                        </div>

                        <div className="results-list">
                            {result.evaluations.map((evaluation, index) => (
                                <div key={index} className={`result-item ${evaluation.isCorrect ? 'correct' : 'incorrect'}`}>
                                    <div className="result-header">
                                        {evaluation.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                        <span>Question {index + 1}</span>
                                    </div>
                                    <p className="feedback">{evaluation.feedback}</p>
                                    {!evaluation.isCorrect && <p className="explanation">{evaluation.explanation}</p>}
                                </div>
                            ))}
                        </div>

                        <div className="actions">
                            <Link href={`/exercises/vocabulary/${theme}?level=${level}`} className="btn btn-primary">
                                Recommencer
                            </Link>
                            <Link href="/exercises/vocabulary" className="btn btn-secondary">
                                Autres thèmes
                            </Link>
                        </div>
                    </div>
                </div>
                <style jsx>{`
                    .exercise-page { min-height: 100vh; padding: 3rem 0; background: linear-gradient(135deg, #dcfce7 0%, var(--background) 50%); }
                    .result-card { background: var(--card); padding: 3rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); max-width: 800px; margin: 0 auto; text-align: center; }
                    .trophy-success { color: #22c55e; margin-bottom: 1rem; }
                    .trophy-fail { color: #f59e0b; margin-bottom: 1rem; }
                    h1 { font-size: 2rem; margin-bottom: 2rem; }
                    .score-display { margin-bottom: 2rem; }
                    .score-value { font-size: 3rem; font-weight: 700; color: var(--primary-600); }
                    .score-label { color: var(--muted-foreground); margin-top: 0.5rem; }
                    .results-list { text-align: left; margin: 2rem 0; }
                    .result-item { padding: 1rem; border-radius: var(--radius-lg); margin-bottom: 1rem; border: 2px solid transparent; }
                    .result-item.correct { background: #dcfce7; border-color: #22c55e; }
                    .result-item.incorrect { background: #fee2e2; border-color: #ef4444; }
                    .result-header { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; margin-bottom: 0.5rem; }
                    .result-item.correct .result-header { color: #16a34a; }
                    .result-item.incorrect .result-header { color: #dc2626; }
                    .feedback { font-size: 0.95rem; margin-bottom: 0.5rem; }
                    .explanation { font-size: 0.875rem; color: var(--muted-foreground); font-style: italic; }
                    .actions { display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; }
                `}</style>
            </main>
        );
    }

    return (
        <main className="exercise-page">
            <div className="container">
                <Link href={`/exercises/vocabulary`} className="back-link">
                    <ArrowLeft size={20} />
                    Retour
                </Link>

                <div className="exercise-header">
                    <h1>{exercise.title}</h1>
                    <p>{exercise.description}</p>
                    <div className="meta">
                        <span className="badge">Niveau {level}</span>
                        <span className="badge">{theme}</span>
                        <span className="progress-text">{answeredCount} / {totalQuestions} réponses</span>
                    </div>
                </div>

                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}></div>
                </div>

                {currentQuestion && (
                    <div className="question-card">
                        <div className="question-number">Question {currentQuestionIndex + 1} / {totalQuestions}</div>
                        <h2>{currentQuestion.question}</h2>

                        {currentQuestion.options ? (
                            <div className="options-list">
                                {currentQuestion.options.map((option, index) => (
                                    <label key={index} className="option-item">
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestion.id}`}
                                            value={option}
                                            checked={answers[currentQuestion.id] === option}
                                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                        />
                                        <span className="option-text">{option}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <input
                                type="text"
                                className="text-input"
                                placeholder="Votre réponse..."
                                value={answers[currentQuestion.id] || ''}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            />
                        )}
                    </div>
                )}

                <div className="navigation">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="btn btn-secondary"
                    >
                        Précédent
                    </button>
                    
                    {currentQuestionIndex < totalQuestions - 1 ? (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="btn btn-primary"
                        >
                            Suivant
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || answeredCount < totalQuestions}
                            className="btn btn-success"
                        >
                            {submitting ? 'Envoi...' : 'Soumettre'}
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
                .exercise-page { min-height: 100vh; padding: 3rem 0; background: linear-gradient(135deg, #dcfce7 0%, var(--background) 50%); }
                .container { max-width: 800px; margin: 0 auto; padding: 0 1rem; }
                .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--primary-600); margin-bottom: 2rem; font-weight: 500; transition: gap 0.2s; }
                .back-link:hover { gap: 0.75rem; }
                .exercise-header { text-align: center; margin-bottom: 2rem; }
                .exercise-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
                .exercise-header p { color: var(--muted-foreground); margin-bottom: 1rem; }
                .meta { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
                .badge { padding: 0.25rem 0.75rem; background: var(--primary-100); color: var(--primary-700); border-radius: var(--radius-full); font-size: 0.875rem; font-weight: 600; }
                .progress-text { padding: 0.25rem 0.75rem; background: var(--muted); color: var(--foreground); border-radius: var(--radius-full); font-size: 0.875rem; font-weight: 600; }
                .progress-bar { height: 8px; background: var(--muted); border-radius: var(--radius-full); overflow: hidden; margin-bottom: 2rem; }
                .progress-fill { height: 100%; background: linear-gradient(90deg, #22c55e, #16a34a); transition: width 0.3s ease; }
                .question-card { background: var(--card); padding: 2rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-md); margin-bottom: 2rem; }
                .question-number { color: var(--muted-foreground); font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; }
                .question-card h2 { font-size: 1.5rem; margin-bottom: 2rem; }
                .options-list { display: flex; flex-direction: column; gap: 1rem; }
                .option-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 2px solid var(--border); border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s; }
                .option-item:hover { border-color: var(--primary-600); background: var(--primary-50); }
                .option-item input[type="radio"] { width: 20px; height: 20px; cursor: pointer; }
                .option-item input[type="radio"]:checked + .option-text { font-weight: 600; color: var(--primary-600); }
                .option-text { flex: 1; }
                .text-input { width: 100%; padding: 1rem; border: 2px solid var(--border); border-radius: var(--radius-lg); font-size: 1rem; transition: border-color 0.2s; }
                .text-input:focus { outline: none; border-color: var(--primary-600); }
                .navigation { display: flex; gap: 1rem; justify-content: space-between; }
                .btn { padding: 0.75rem 2rem; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
                .btn-primary { background: var(--primary-600); color: white; }
                .btn-primary:hover:not(:disabled) { background: var(--primary-700); }
                .btn-secondary { background: var(--muted); color: var(--foreground); }
                .btn-secondary:hover:not(:disabled) { background: var(--muted-foreground); color: white; }
                .btn-success { background: #22c55e; color: white; }
                .btn-success:hover:not(:disabled) { background: #16a34a; }
                .btn:disabled { opacity: 0.5; cursor: not-allowed; }
                @media (max-width: 768px) {
                    .exercise-header h1 { font-size: 1.5rem; }
                    .question-card h2 { font-size: 1.25rem; }
                    .navigation { flex-direction: column; }
                }
            `}</style>
        </main>
    );
}
