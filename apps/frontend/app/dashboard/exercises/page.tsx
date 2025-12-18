'use client';

import { useState } from 'react';
import { Loader2, ChevronRight, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import {
  useExerciseTypes,
  useExerciseLevels,
  useExerciseThemes,
  useGenerateExercise,
  useSubmitExercise,
} from '@/hooks/useExercises';
import { useAuthStore } from '@/hooks/useAuth';

type Step = 'select' | 'exercise' | 'results';

export default function ExercisesPage() {
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>('select');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(user?.level || 'A1');
  const [selectedTheme, setSelectedTheme] = useState('general');
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any>(null);
  const [startTime] = useState(Date.now());

  const { data: types } = useExerciseTypes();
  const { data: levels } = useExerciseLevels();
  const { data: themes } = useExerciseThemes();
  const generateMutation = useGenerateExercise();
  const submitMutation = useSubmitExercise();

  const handleGenerate = async () => {
    const result = await generateMutation.mutateAsync({
      type: selectedType,
      level: selectedLevel,
      theme: selectedTheme,
      count: 5,
    });
    setCurrentExercise(result);
    setStep('exercise');
  };

  const handleSubmit = async () => {
    const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    const result = await submitMutation.mutateAsync({
      exerciseId: currentExercise.exerciseId,
      answers: answersArray,
      timeSpent,
    });

    setResults(result);
    setStep('results');
  };

  const resetExercise = () => {
    setStep('select');
    setCurrentExercise(null);
    setAnswers({});
    setResults(null);
    setSelectedType('');
  };

  return (
    <div className="exercises-page">
      <header className="page-header">
        <h1>Exercices</h1>
        <p>Pratiquez avec des exercices générés par IA</p>
      </header>

      {step === 'select' && (
        <div className="selection-panel animate-fadeIn">
          {/* Type Selection */}
          <div className="selection-section">
            <h2>Type d'exercice</h2>
            <div className="type-grid">
              {types?.map((type) => (
                <button
                  key={type.id}
                  className={`type-card ${selectedType === type.id ? 'selected' : ''}`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <span className="type-icon">{type.icon}</span>
                  <span className="type-name">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Level Selection */}
          <div className="selection-section">
            <h2>Niveau</h2>
            <div className="level-grid">
              {levels?.map((level) => (
                <button
                  key={level.id}
                  className={`level-btn ${selectedLevel === level.id ? 'selected' : ''}`}
                  onClick={() => setSelectedLevel(level.id)}
                >
                  {level.id}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div className="selection-section">
            <h2>Thème</h2>
            <div className="theme-grid">
              {themes?.map((theme) => (
                <button
                  key={theme.id}
                  className={`theme-btn ${selectedTheme === theme.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTheme(theme.id)}
                >
                  <span>{theme.icon}</span>
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {generateMutation.error && (
            <div className="error-message">
              <p>❌ {generateMutation.error.message || 'Une erreur est survenue lors de la génération'}</p>
            </div>
          )}

          <button
            className="btn btn-primary btn-lg generate-btn"
            onClick={handleGenerate}
            disabled={!selectedType || generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Génération en cours...
              </>
            ) : (
              <>
                Générer l'exercice
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      )}

      {step === 'exercise' && currentExercise && (
        <div className="exercise-panel animate-fadeIn">
          <button className="back-btn" onClick={resetExercise}>
            <ArrowLeft size={18} />
            Retour
          </button>

          <div className="exercise-header">
            <h2>{currentExercise.title}</h2>
            <p>{currentExercise.description}</p>
            <div className="exercise-tags">
              <span className="badge badge-primary">{selectedType}</span>
              <span className="badge badge-level">{selectedLevel}</span>
            </div>
          </div>

          <div className="questions">
            {currentExercise.questions?.map(
              (q: any, index: number) => (
                <div key={q.id} className="question-card">
                  <div className="question-header">
                    <span className="question-number">Question {index + 1}</span>
                  </div>
                  <p className="question-text">{q.question}</p>

                  {q.options ? (
                    <div className="options">
                      {q.options.map((option: string, optIndex: number) => (
                        <label
                          key={optIndex}
                          className={`option ${answers[q.id] === option ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={option}
                            checked={answers[q.id] === option}
                            onChange={(e) =>
                              setAnswers({ ...answers, [q.id]: e.target.value })
                            }
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Votre réponse..."
                      value={answers[q.id] || ''}
                      onChange={(e) =>
                        setAnswers({ ...answers, [q.id]: e.target.value })
                      }
                    />
                  )}
                </div>
              )
            )}
          </div>

          <button
            className="btn btn-primary btn-lg submit-btn"
            onClick={handleSubmit}
            disabled={submitMutation.isPending || Object.keys(answers).length === 0}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Évaluation...
              </>
            ) : (
              'Soumettre mes réponses'
            )}
          </button>
        </div>
      )}

      {step === 'results' && results && (
        <div className="results-panel animate-fadeIn">
          <div className="results-header">
            <div className={`score-circle ${results.passed ? 'passed' : 'failed'}`}>
              <span className="score-value">{Math.round(results.percentage)}%</span>
              <span className="score-label">Score</span>
            </div>
            <h2>{results.passed ? 'Félicitations !' : 'Continuez à pratiquer !'}</h2>
            <p>
              Vous avez obtenu {results.score} points sur {results.maxScore}
            </p>
          </div>

          <div className="evaluations">
            {results.evaluations?.map((evaluation: any, index: number) => (
              <div
                key={evaluation.questionId}
                className={`evaluation-card ${evaluation.isCorrect ? 'correct' : 'incorrect'}`}
              >
                <div className="evaluation-header">
                  <span className="evaluation-icon">
                    {evaluation.isCorrect ? (
                      <CheckCircle size={20} />
                    ) : (
                      <XCircle size={20} />
                    )}
                  </span>
                  <span>Question {index + 1}</span>
                </div>
                <p className="feedback">{evaluation.feedback}</p>
                {!evaluation.isCorrect && evaluation.explanation && (
                  <p className="explanation">{evaluation.explanation}</p>
                )}
              </div>
            ))}
          </div>

          <div className="results-actions">
            <button className="btn btn-primary btn-lg" onClick={resetExercise}>
              Nouvel exercice
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .exercises-page {
          max-width: 900px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: var(--muted-foreground);
        }

        .selection-section {
          margin-bottom: 2rem;
        }

        .selection-section h2 {
          font-size: 1.125rem;
          margin-bottom: 1rem;
        }

        .type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.75rem;
        }

        .type-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: var(--card);
          border: 2px solid var(--border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.15s;
        }

        .type-card:hover {
          border-color: var(--primary-300);
        }

        .type-card.selected {
          border-color: var(--primary-500);
          background: var(--primary-50);
        }

        .type-icon {
          font-size: 1.5rem;
        }

        .type-name {
          font-size: 0.875rem;
          text-align: center;
        }

        .level-grid {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .level-btn {
          padding: 0.75rem 1.5rem;
          background: var(--card);
          border: 2px solid var(--border);
          border-radius: var(--radius-lg);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .level-btn:hover {
          border-color: var(--primary-300);
        }

        .level-btn.selected {
          border-color: var(--primary-500);
          background: var(--primary-500);
          color: white;
        }

        .theme-grid {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .theme-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--card);
          border: 2px solid var(--border);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all 0.15s;
        }

        .theme-btn:hover {
          border-color: var(--primary-300);
        }

        .theme-btn.selected {
          border-color: var(--primary-500);
          background: var(--primary-50);
        }

        .error-message {
          background: var(--error-50);
          border: 1px solid var(--error-200);
          border-radius: var(--radius-lg);
          padding: 1rem;
          margin-bottom: 1rem;
          color: var(--error-700);
          text-align: center;
        }

        .error-message p {
          margin: 0;
          font-size: 0.9375rem;
        }

        .generate-btn {
          width: 100%;
          margin-top: 1rem;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: var(--muted-foreground);
          cursor: pointer;
          margin-bottom: 1rem;
        }

        .back-btn:hover {
          color: var(--foreground);
        }

        .exercise-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .exercise-header h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .exercise-tags {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .question-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .question-header {
          margin-bottom: 0.75rem;
        }

        .question-number {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--primary-600);
        }

        .question-text {
          font-size: 1.125rem;
          margin-bottom: 1rem;
        }

        .options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--muted);
          border: 2px solid transparent;
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.15s;
        }

        .option:hover {
          background: var(--primary-50);
        }

        .option.selected {
          background: var(--primary-100);
          border-color: var(--primary-500);
        }

        .option input {
          display: none;
        }

        .submit-btn {
          width: 100%;
          margin-top: 1rem;
        }

        .results-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .score-circle.passed {
          background: var(--success-100);
          color: var(--success-700);
        }

        .score-circle.failed {
          background: var(--warning-100);
          color: var(--warning-700);
        }

        .score-value {
          font-size: 2rem;
          font-weight: 700;
        }

        .score-label {
          font-size: 0.875rem;
        }

        .evaluation-card {
          padding: 1rem;
          border-radius: var(--radius-lg);
          margin-bottom: 0.75rem;
        }

        .evaluation-card.correct {
          background: var(--success-50);
          border: 1px solid var(--success-200);
        }

        .evaluation-card.incorrect {
          background: var(--error-50);
          border: 1px solid var(--error-200);
        }

        .evaluation-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .evaluation-card.correct .evaluation-icon {
          color: var(--success-600);
        }

        .evaluation-card.incorrect .evaluation-icon {
          color: var(--error-600);
        }

        .feedback {
          margin-bottom: 0.5rem;
        }

        .explanation {
          font-size: 0.875rem;
          color: var(--muted-foreground);
        }

        .results-actions {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}
