import Groq from 'groq-sdk';
import { env } from '../config/env.js';
import { generatePromptHash } from '../utils/security.js';
import { cacheAIResponse, getAICachedResponse, checkAIRateLimit } from '../config/redis.js';
import type { Level, ExerciseType, ResponseStyle } from '@prisma/client';

// Initialize Groq client
let groqClient: Groq | null = null;

function getGroqClient(): Groq | null {
  if (groqClient) return groqClient;

  if (!env.GROQ_API_KEY) {
    console.warn('⚠️ AI service not configured (GROQ_API_KEY missing)');
    return null;
  }

  groqClient = new Groq({
    apiKey: env.GROQ_API_KEY,
  });

  return groqClient;
}

// =============================================================================
// TYPES
// =============================================================================

interface GenerateExerciseParams {
  type: ExerciseType;
  level: Level;
  theme: string;
  style: ResponseStyle;
  useFormal: boolean;
  count: number;
}

interface ExerciseQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface GeneratedExercise {
  title: string;
  description: string;
  questions: ExerciseQuestion[];
}

interface EvaluateAnswerParams {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  style: ResponseStyle;
  useFormal: boolean;
}

interface AnswerEvaluation {
  isCorrect: boolean;
  score: number;
  feedback: string;
  explanation: string;
  suggestions?: string[];
}

interface GenerateCourseParams {
  topic: string;
  level: Level;
  type: 'GRAMMAR' | 'CONJUGATION' | 'VOCABULARY' | 'CONVERSATION';
}

interface CourseContent {
  title: string;
  introduction: string;
  sections: {
    title: string;
    content: string;
    examples: string[];
    exercises?: ExerciseQuestion[];
  }[];
  summary: string;
}

// =============================================================================
// PROMPTS
// =============================================================================

const SYSTEM_PROMPTS = {
  exerciseGenerator: `You are an expert English language teacher creating exercises for French-speaking students learning English.
Your exercises should be:
- Appropriate for the specified CEFR level (A1-C2)
- Focused on the given theme
- Clear and pedagogically sound
- Include helpful explanations in French for feedback

Always respond with valid JSON matching the requested structure.`,

  answerEvaluator: `You are an English language teacher evaluating student answers.
Provide constructive feedback that:
- Clearly indicates if the answer is correct
- Explains any errors in a supportive way
- Gives the correct answer if wrong
- Provides tips for improvement

Respond in a supportive, encouraging tone.`,

  courseGenerator: `You are an expert English language curriculum designer creating comprehensive lessons for French-speaking students.
Your content should be:
- Well-structured and progressive
- Include clear explanations with French translations where helpful
- Provide relevant examples from real-world contexts
- Include practice exercises
- Follow pedagogical best practices

Always respond with valid JSON matching the requested structure.`,
};

function getExercisePrompt(params: GenerateExerciseParams): string {
  const formalityInstruction = params.useFormal
    ? 'Use formal language (vouvoiement) in all French explanations.'
    : 'Use informal language (tutoiement) in all French explanations.';

  const styleInstruction = {
    SHORT: 'Keep feedback brief and to the point.',
    DETAILED: 'Provide comprehensive, detailed explanations.',
    ADAPTIVE: 'Adapt explanation length based on complexity.',
  }[params.style];

  return `Create ${params.count} ${params.type.replace('_', ' ').toLowerCase()} exercises for level ${params.level} on the theme "${params.theme}".

${formalityInstruction}
${styleInstruction}

Respond with a JSON object with this EXACT structure:
{
  "title": "Exercise title in English",
  "description": "Brief description of the exercise in French",
  "questions": [
    {
      "id": "q1",
      "question": "The question in English",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The correct answer",
      "explanation": "Explanation in French"
    }
  ]
}

For ${params.type}:
${getTypeSpecificInstructions(params.type)}`;
}

function getTypeSpecificInstructions(type: ExerciseType): string {
  const instructions: Record<ExerciseType, string> = {
    INFINITIVE_VERBS: 'Focus on identifying base forms of verbs and their usage.',
    CONJUGATION: 'Test various tenses and verb forms. Include regular and irregular verbs.',
    VOCABULARY: 'Test word meanings, synonyms, antonyms, and usage in context.',
    GRAMMAR: 'Cover grammar rules, sentence structure, and correct usage.',
    READING: 'Include a short passage followed by comprehension questions.',
    LISTENING: 'Describe audio scenarios and test comprehension.',
    TRANSLATION: 'Provide French sentences to translate to English or vice versa.',
    FILL_BLANK: 'Create sentences with blanks to fill in appropriate words.',
    MULTIPLE_CHOICE: 'Provide clear options with one correct answer.',
    MATCHING: 'Create pairs to match (words with definitions, etc.).',
  };
  return instructions[type] || 'Create clear, level-appropriate questions.';
}

function getEvaluationPrompt(params: EvaluateAnswerParams): string {
  const formalityInstruction = params.useFormal
    ? 'Use formal language (vouvoiement) in feedback.'
    : 'Use informal language (tutoiement) in feedback.';

  const styleInstruction = {
    SHORT: 'Keep feedback brief (1-2 sentences).',
    DETAILED: 'Provide comprehensive feedback with examples.',
    ADAPTIVE: 'Match feedback length to the complexity of the error.',
  }[params.style];

  return `Evaluate this student answer:

Question: ${params.question}
Correct Answer: ${params.correctAnswer}
Student Answer: ${params.userAnswer}

${formalityInstruction}
${styleInstruction}

Respond with a JSON object:
{
  "isCorrect": true/false,
  "score": 0-100,
  "feedback": "Brief feedback in French",
  "explanation": "Detailed explanation in French if incorrect",
  "suggestions": ["Improvement suggestion 1", "Suggestion 2"]
}`;
}

function getCoursePrompt(params: GenerateCourseParams): string {
  return `Create a comprehensive ${params.type.toLowerCase()} lesson for level ${params.level} on the topic "${params.topic}".

Respond with a JSON object:
{
  "title": "Lesson title in English",
  "introduction": "Introduction in French explaining what will be learned",
  "sections": [
    {
      "title": "Section title",
      "content": "Detailed content in French with English examples",
      "examples": ["Example 1", "Example 2"],
      "exercises": [
        {
          "id": "ex1",
          "question": "Practice question",
          "correctAnswer": "Answer",
          "explanation": "Why this is correct"
        }
      ]
    }
  ],
  "summary": "Key points summary in French"
}`;
}

// =============================================================================
// AI SERVICE FUNCTIONS
// =============================================================================

export async function generateExercise(
  userId: string,
  params: GenerateExerciseParams
): Promise<{ data?: GeneratedExercise; error?: string; cached?: boolean }> {
  // Check rate limit
  const rateLimit = await checkAIRateLimit(userId);
  if (!rateLimit.allowed) {
    return {
      error: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.`,
    };
  }

  const client = getGroqClient();
  if (!client) {
    return { error: 'AI service not configured' };
  }

  const prompt = getExercisePrompt(params);
  const promptHash = generatePromptHash(prompt);

  // Check cache
  const cached = await getAICachedResponse<GeneratedExercise>(promptHash);
  if (cached) {
    return { data: cached, cached: true };
  }

  try {
    const completion = await client.chat.completions.create({
      model: env.GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.exerciseGenerator },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { error: 'No response from AI' };
    }

    const data = JSON.parse(content) as GeneratedExercise;

    // Cache the response
    await cacheAIResponse(promptHash, data);

    return { data };
  } catch (error) {
    console.error('AI exercise generation error:', error);
    return { error: 'Failed to generate exercise' };
  }
}

export async function evaluateAnswer(
  userId: string,
  params: EvaluateAnswerParams
): Promise<{ data?: AnswerEvaluation; error?: string }> {
  // Check rate limit
  const rateLimit = await checkAIRateLimit(userId);
  if (!rateLimit.allowed) {
    return {
      error: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.`,
    };
  }

  const client = getGroqClient();
  if (!client) {
    // Fallback to simple comparison
    const isCorrect =
      params.userAnswer.toLowerCase().trim() ===
      params.correctAnswer.toLowerCase().trim();
    return {
      data: {
        isCorrect,
        score: isCorrect ? 100 : 0,
        feedback: isCorrect ? 'Correct!' : 'Incorrect.',
        explanation: isCorrect
          ? ''
          : `The correct answer is: ${params.correctAnswer}`,
      },
    };
  }

  const prompt = getEvaluationPrompt(params);

  try {
    const completion = await client.chat.completions.create({
      model: env.GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.answerEvaluator },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { error: 'No response from AI' };
    }

    return { data: JSON.parse(content) as AnswerEvaluation };
  } catch (error) {
    console.error('AI evaluation error:', error);
    return { error: 'Failed to evaluate answer' };
  }
}

export async function generateCourseContent(
  userId: string,
  params: GenerateCourseParams
): Promise<{ data?: CourseContent; error?: string; cached?: boolean }> {
  // Check rate limit
  const rateLimit = await checkAIRateLimit(userId);
  if (!rateLimit.allowed) {
    return {
      error: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.`,
    };
  }

  const client = getGroqClient();
  if (!client) {
    return { error: 'AI service not configured' };
  }

  const prompt = getCoursePrompt(params);
  const promptHash = generatePromptHash(prompt);

  // Check cache
  const cached = await getAICachedResponse<CourseContent>(promptHash);
  if (cached) {
    return { data: cached, cached: true };
  }

  try {
    const completion = await client.chat.completions.create({
      model: env.GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.courseGenerator },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 6000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { error: 'No response from AI' };
    }

    const data = JSON.parse(content) as CourseContent;

    // Cache the response
    await cacheAIResponse(promptHash, data);

    return { data };
  } catch (error) {
    console.error('AI course generation error:', error);
    return { error: 'Failed to generate course content' };
  }
}

// =============================================================================
// PLACEMENT TEST
// =============================================================================

interface PlacementQuestion {
  id: string;
  level: Level;
  question: string;
  options: string[];
  correctAnswer: string;
}

export async function generatePlacementTest(): Promise<{
  data?: PlacementQuestion[];
  error?: string;
}> {
  const client = getGroqClient();
  if (!client) {
    return { error: 'AI service not configured' };
  }

  const prompt = `Generate a 25-question placement test for English learners.
The test should cover all CEFR levels (A1-C2) with questions distributed as:
- 5 questions A1 level (basic)
- 5 questions A2 level (elementary)
- 5 questions B1 level (intermediate)
- 5 questions B2 level (upper intermediate)
- 5 questions C1/C2 level (advanced)

Each question should test grammar, vocabulary, or comprehension appropriate for its level.

Respond with a JSON array:
[
  {
    "id": "q1",
    "level": "A1",
    "question": "Complete: She ___ a student.",
    "options": ["is", "are", "am", "be"],
    "correctAnswer": "is"
  }
]`;

  try {
    const completion = await client.chat.completions.create({
      model: env.GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.exerciseGenerator },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 5000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { error: 'No response from AI' };
    }

    const parsed = JSON.parse(content);
    const questions = Array.isArray(parsed) ? parsed : parsed.questions;

    return { data: questions as PlacementQuestion[] };
  } catch (error) {
    console.error('AI placement test generation error:', error);
    return { error: 'Failed to generate placement test' };
  }
}

export function calculatePlacementLevel(
  answers: { questionId: string; answer: string }[],
  questions: PlacementQuestion[]
): { level: Level; score: number; passed: boolean } {
  const levelScores: Record<Level, { correct: number; total: number }> = {
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
    C1: { correct: 0, total: 0 },
    C2: { correct: 0, total: 0 },
  };

  // Calculate scores per level
  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (question) {
      levelScores[question.level].total++;
      if (
        answer.answer.toLowerCase().trim() ===
        question.correctAnswer.toLowerCase().trim()
      ) {
        levelScores[question.level].correct++;
      }
    }
  }

  // Calculate overall score
  let totalCorrect = 0;
  let totalQuestions = 0;
  for (const level of Object.values(levelScores)) {
    totalCorrect += level.correct;
    totalQuestions += level.total;
  }

  const score = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  const passed = score >= 80;

  // Determine highest passed level
  const levels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  let determinedLevel: Level = 'A1';

  for (const level of levels) {
    const levelData = levelScores[level];
    if (!levelData || levelData.total === 0) continue;

    const levelScore = (levelData.correct / levelData.total) * 100;

    if (levelScore >= 60) {
      determinedLevel = level;
    } else {
      break;
    }
  }


  return { level: determinedLevel, score, passed };
}
