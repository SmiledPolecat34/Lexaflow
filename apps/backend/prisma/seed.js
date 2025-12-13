import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // Create admin user
    const passwordHash = await bcrypt.hash('admin123' + (process.env.PASSWORD_PEPPER || 'dev-pepper'), 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@lexaflow.com' },
        update: {},
        create: {
            email: 'admin@lexaflow.com',
            passwordHash,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            isEmailVerified: true,
            consentGiven: true,
            consentDate: new Date(),
        },
    });
    console.log('✅ Admin user created:', admin.email);
    // Create badges
    const badges = [
        // Streak badges
        { code: 'STREAK_7', name: '7 Day Streak', description: 'Practice 7 days in a row', rarity: 'COMMON', points: 50, conditions: { type: 'streak', value: 7 } },
        { code: 'STREAK_30', name: '30 Day Streak', description: 'Practice 30 days in a row', rarity: 'UNCOMMON', points: 200, conditions: { type: 'streak', value: 30 } },
        { code: 'STREAK_100', name: '100 Day Streak', description: 'Practice 100 days in a row', rarity: 'RARE', points: 500, conditions: { type: 'streak', value: 100 } },
        { code: 'STREAK_365', name: 'Year Streak', description: 'Practice every day for a year', rarity: 'LEGENDARY', points: 2000, conditions: { type: 'streak', value: 365 } },
        // Exercise badges
        { code: 'EXERCISES_10', name: 'Getting Started', description: 'Complete 10 exercises', rarity: 'COMMON', points: 30, conditions: { type: 'exercises', value: 10 } },
        { code: 'EXERCISES_50', name: 'Practice Makes Perfect', description: 'Complete 50 exercises', rarity: 'UNCOMMON', points: 100, conditions: { type: 'exercises', value: 50 } },
        { code: 'EXERCISES_100', name: 'Dedicated Learner', description: 'Complete 100 exercises', rarity: 'RARE', points: 250, conditions: { type: 'exercises', value: 100 } },
        { code: 'EXERCISES_500', name: 'Exercise Master', description: 'Complete 500 exercises', rarity: 'EPIC', points: 750, conditions: { type: 'exercises', value: 500 } },
        // Level badges
        { code: 'LEVEL_A2', name: 'Elementary', description: 'Reach A2 level', rarity: 'COMMON', points: 100, conditions: { type: 'level', value: 'A2' } },
        { code: 'LEVEL_B1', name: 'Intermediate', description: 'Reach B1 level', rarity: 'UNCOMMON', points: 200, conditions: { type: 'level', value: 'B1' } },
        { code: 'LEVEL_B2', name: 'Upper Intermediate', description: 'Reach B2 level', rarity: 'RARE', points: 400, conditions: { type: 'level', value: 'B2' } },
        { code: 'LEVEL_C1', name: 'Advanced', description: 'Reach C1 level', rarity: 'EPIC', points: 800, conditions: { type: 'level', value: 'C1' } },
        { code: 'LEVEL_C2', name: 'Master', description: 'Reach C2 level', rarity: 'LEGENDARY', points: 1500, conditions: { type: 'level', value: 'C2' } },
        // Special badges
        { code: 'FIRST_EXERCISE', name: 'First Steps', description: 'Complete your first exercise', rarity: 'COMMON', points: 10, conditions: { type: 'first_exercise' } },
        { code: 'PERFECT_SCORE', name: 'Perfect Score', description: 'Get 100% on an exercise', rarity: 'UNCOMMON', points: 75, conditions: { type: 'perfect_score' } },
        { code: 'COURSE_COMPLETE', name: 'Course Graduate', description: 'Complete a full course', rarity: 'RARE', points: 300, conditions: { type: 'course_complete' } },
    ];
    for (const badge of badges) {
        await prisma.badge.upsert({
            where: { code: badge.code },
            update: {},
            create: {
                code: badge.code,
                name: badge.name,
                description: badge.description,
                rarity: badge.rarity,
                points: badge.points,
                conditions: badge.conditions,
            },
        });
    }
    console.log(`✅ ${badges.length} badges created`);
    // Create sample courses
    const courses = [
        {
            type: 'GRAMMAR',
            level: 'A1',
            title: 'English Grammar Basics',
            description: 'Learn the fundamentals of English grammar',
            order: 1,
            duration: 120,
            content: { intro: 'Welcome to English Grammar Basics!' },
            isPublished: true,
        },
        {
            type: 'GRAMMAR',
            level: 'A2',
            title: 'Elementary Grammar',
            description: 'Build on your basic grammar knowledge',
            order: 2,
            duration: 150,
            content: { intro: 'Take your grammar to the next level!' },
            isPublished: true,
        },
        {
            type: 'CONJUGATION',
            level: 'A1',
            title: 'Present Simple & Continuous',
            description: 'Master the present tenses',
            order: 1,
            duration: 90,
            content: { intro: 'Learn when to use present simple vs continuous' },
            isPublished: true,
        },
        {
            type: 'VOCABULARY',
            level: 'A1',
            title: 'Essential Vocabulary',
            description: 'Learn the most common English words',
            order: 1,
            duration: 60,
            content: { intro: 'Start building your vocabulary!' },
            isPublished: true,
        },
    ];
    for (const course of courses) {
        const created = await prisma.course.create({
            data: course,
        });
        // Add sample lessons
        await prisma.lesson.createMany({
            data: [
                { courseId: created.id, title: 'Introduction', content: { text: 'Welcome!' }, order: 1 },
                { courseId: created.id, title: 'Lesson 1', content: { text: 'First lesson content' }, order: 2 },
                { courseId: created.id, title: 'Practice', content: { text: 'Practice exercises' }, order: 3 },
            ],
        });
    }
    console.log(`✅ ${courses.length} courses with lessons created`);
    // Create AI prompts
    const prompts = [
        {
            name: 'exercise_generator',
            category: 'exercises',
            template: 'Generate {count} {type} exercises for level {level} on theme {theme}.',
            variables: ['count', 'type', 'level', 'theme'],
        },
        {
            name: 'answer_evaluator',
            category: 'evaluation',
            template: 'Evaluate the answer: Question: {question}, Correct: {correct}, User: {answer}',
            variables: ['question', 'correct', 'answer'],
        },
        {
            name: 'course_generator',
            category: 'courses',
            template: 'Create a {type} lesson for level {level} about {topic}.',
            variables: ['type', 'level', 'topic'],
        },
    ];
    for (const prompt of prompts) {
        await prisma.aIPrompt.upsert({
            where: { name: prompt.name },
            update: {},
            create: prompt,
        });
    }
    console.log(`✅ ${prompts.length} AI prompts created`);
    console.log('🎉 Seeding completed!');
}
main()
    .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
