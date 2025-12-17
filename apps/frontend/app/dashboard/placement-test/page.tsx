'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Loader2, Award } from 'lucide-react';
import { coursesApi, userApi } from '@/lib/api';

export default function PlacementTestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [started, setStarted] = useState(false);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<{ level: string; score: number } | null>(null);

    const handleStart = async () => {
        try {
            setLoading(true);
            const response = await coursesApi.getPlacementTest();
            if (response.data) {
                setQuestions(response.data.questions);
                setStarted(true);
            }
        } catch (error) {
            console.error('Failed to load placement test:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const answersList = questions.map(q => ({
                questionId: q.id,
                answer: answers[q.id] || '',
            }));

            const response = await coursesApi.submitPlacementTest(answersList, questions);
            if (response.data) {
                setResult(response.data);
                // Update user level
                await userApi.updatePreferences({ level: response.data.level });
            }
        } catch (error) {
            console.error('Failed to submit test:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (result) {
        return (
            <main className="placement-test-page">
                <div className="container">
                    <div className="result-card">
                        <Award size={64} className="icon-success" />
                        <h1>Test de placement terminé !</h1>
                        <div className="level-badge">{result.level}</div>
                        <p>Votre niveau détecté : <strong>{result.level}</strong></p>
                        <p className="score">Score : {result.score}%</p>
                        <div className="actions">
                            <button onClick={() => router.push('/dashboard')} className="btn btn-primary">
                                Aller au tableau de bord
                            </button>
                        </div>
                    </div>
                </div>
                <style jsx>{`
                    .placement-test-page { min-height: 100vh; padding: 3rem 0; background: linear-gradient(135deg, var(--primary-50) 0%, var(--background) 50%); }
                    .container { max-width: 800px; margin: 0 auto; padding: 0 1rem; }
                    .result-card { background: var(--card); padding: 3rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); text-align: center; }
                    .icon-success { color: var(--primary-600); margin-bottom: 1rem; }
                    h1 { font-size: 2rem; margin-bottom: 1.5rem; }
                    .level-badge { display: inline-block; padding: 0.75rem 2rem; background: linear-gradient(135deg, var(--primary-600), var(--secondary-600)); color: white; border-radius: var(--radius-full); font-size: 2rem; font-weight: 700; margin: 1.5rem 0; }
                    .score { font-size: 1.25rem; color: var(--muted-foreground); margin-top: 1rem; }
                    .actions { margin-top: 2rem; }
                    .btn { padding: 0.75rem 2rem; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; border: none; }
                    .btn-primary { background: var(--primary-600); color: white; }
                `}</style>
            </main>
        );
    }

    if (!started) {
        return (
            <main className="placement-test-page">
                <div className="container">
                    <Link href="/dashboard" className="back-link">
                        <ArrowLeft size={20} />
                        Retour au tableau de bord
                    </Link>
                    <div className="intro-card">
                        <Award size={64} className="icon-primary" />
                        <h1>Test de placement</h1>
                        <p>Déterminez votre niveau d&apos;anglais avec notre test adaptatif</p>
                        <div className="info-list">
                            <div className="info-item">
                                <CheckCircle size={20} />
                                <span>20 questions variées</span>
                            </div>
                            <div className="info-item">
                                <CheckCircle size={20} />
                                <span>~10 minutes</span>
                            </div>
                            <div className="info-item">
                                <CheckCircle size={20} />
                                <span>Résultat immédiat</span>
                            </div>
                        </div>
                        <button onClick={handleStart} disabled={loading} className="btn btn-primary">
                            {loading ? <><Loader2 size={20} className="spinner" /> Chargement...</> : 'Commencer le test'}
                        </button>
                    </div>
                </div>
                <style jsx>{`
                    .placement-test-page { min-height: 100vh; padding: 3rem 0; background: linear-gradient(135deg, var(--primary-50) 0%, var(--background) 50%); }
                    .container { max-width: 800px; margin: 0 auto; padding: 0 1rem; }
                    .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--primary-600); margin-bottom: 2rem; font-weight: 500; }
                    .intro-card { background: var(--card); padding: 3rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); text-align: center; }
                    .icon-primary { color: var(--primary-600); margin-bottom: 1rem; }
                    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
                    p { color: var(--muted-foreground); font-size: 1.125rem; margin-bottom: 2rem; }
                    .info-list { display: flex; flex-direction: column; gap: 1rem; margin: 2rem auto; max-width: 300px; }
                    .info-item { display: flex; align-items: center; gap: 0.75rem; color: var(--primary-600); font-weight: 500; }
                    .btn { padding: 0.75rem 2rem; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 0.5rem; }
                    .btn-primary { background: var(--primary-600); color: white; }
                    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
                    .spinner { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </main>
        );
    }

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;

    return (
        <main className="placement-test-page">
            <div className="container">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}></div>
                </div>

                <div className="question-card">
                    <div className="question-number">Question {currentIndex + 1} / {totalQuestions}</div>
                    <h2>{currentQuestion.question}</h2>

                    {currentQuestion.options ? (
                        <div className="options-list">
                            {currentQuestion.options.map((option: string, index: number) => (
                                <label key={index} className="option-item">
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion.id}`}
                                        value={option}
                                        checked={answers[currentQuestion.id] === option}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
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
                            onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                        />
                    )}
                </div>

                <div className="navigation">
                    <button
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        className="btn btn-secondary"
                    >
                        Précédent
                    </button>
                    
                    {currentIndex < totalQuestions - 1 ? (
                        <button
                            onClick={() => setCurrentIndex(prev => prev + 1)}
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
                            {submitting ? 'Envoi...' : 'Terminer'}
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
                .placement-test-page { min-height: 100vh; padding: 3rem 0; background: linear-gradient(135deg, var(--primary-50) 0%, var(--background) 50%); }
                .container { max-width: 800px; margin: 0 auto; padding: 0 1rem; }
                .progress-bar { height: 8px; background: var(--muted); border-radius: var(--radius-full); overflow: hidden; margin-bottom: 2rem; }
                .progress-fill { height: 100%; background: linear-gradient(90deg, var(--primary-600), var(--secondary-600)); transition: width 0.3s ease; }
                .question-card { background: var(--card); padding: 2rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-md); margin-bottom: 2rem; }
                .question-number { color: var(--muted-foreground); font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; }
                .question-card h2 { font-size: 1.5rem; margin-bottom: 2rem; }
                .options-list { display: flex; flex-direction: column; gap: 1rem; }
                .option-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 2px solid var(--border); border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s; }
                .option-item:hover { border-color: var(--primary-600); background: var(--primary-50); }
                .option-item input[type="radio"] { width: 20px; height: 20px; cursor: pointer; }
                .option-text { flex: 1; }
                .text-input { width: 100%; padding: 1rem; border: 2px solid var(--border); border-radius: var(--radius-lg); font-size: 1rem; }
                .text-input:focus { outline: none; border-color: var(--primary-600); }
                .navigation { display: flex; gap: 1rem; justify-content: space-between; }
                .btn { padding: 0.75rem 2rem; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; border: none; }
                .btn-primary { background: var(--primary-600); color: white; }
                .btn-secondary { background: var(--muted); color: var(--foreground); }
                .btn-success { background: #22c55e; color: white; }
                .btn:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>
        </main>
    );
}
