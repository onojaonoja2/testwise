import { pgTable, uuid, varchar, timestamp, jsonb, pgEnum, text, integer, boolean, foreignKey, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUMS ---
export const userRoleEnum = pgEnum('user_role', ['System Admin', 'Sub Admin', 'Test Creator', 'Test Taker']);
export const subAdminTypeEnum = pgEnum('sub_admin_type', ['Organizational', 'Individual']);
export const testStatusEnum = pgEnum('test_status', ['Draft', 'Published', 'Archived']);
export const questionTypeEnum = pgEnum('question_type', ['Multiple Choice', 'True/False', 'Short Answer']);
export const sessionStatusEnum = pgEnum('session_status', ['In Progress', 'Completed', 'Expired']);

// --- ORGANIZATIONS TABLE ---
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  brandingLogoUrl: varchar('branding_logo_url', { length: 255 }),
  brandingBackgroundUrl: varchar('branding_background_url', { length: 255 }),
  themeColors: jsonb('theme_colors'),
});

// --- USERS TABLE ---
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull(),
  subAdminType: subAdminTypeEnum('sub_admin_type'),
  organizationId: uuid('organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- NEW: TESTS TABLE ---
export const tests = pgTable('tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  creatorId: uuid('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  durationMinutes: integer('duration_minutes').notNull().default(30),
  status: testStatusEnum('status').notNull().default('Draft'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

// --- NEW: QUESTIONS TABLE ---
export const questions = pgTable('questions', {
    id: uuid('id').primaryKey().defaultRandom(),
    testId: uuid('test_id').notNull().references(() => tests.id, { onDelete: 'cascade' }),
    questionText: text('question_text').notNull(),
    questionType: questionTypeEnum('question_type').notNull(),
    order: integer('order').notNull(),
});

// --- NEW: OPTIONS TABLE ---
// For Multiple Choice questions
export const options = pgTable('options', {
    id: uuid('id').primaryKey().defaultRandom(),
    questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
    optionText: text('option_text').notNull(),
    isCorrect: boolean('is_correct').notNull().default(false),
});

// --- NEW: TEST SESSIONS TABLE ---
export const testSessions = pgTable('test_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  testId: uuid('test_id').notNull().references(() => tests.id, { onDelete: 'cascade' }),
  takerId: uuid('taker_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: sessionStatusEnum('status').notNull().default('In Progress'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  // Score stored as a decimal to allow for partial points if needed in the future
  score: decimal('score', { precision: 5, scale: 2 }), 
});

// --- NEW: RESPONSES TABLE ---
export const responses = pgTable('responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => testSessions.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  // Answer can be one of the following, depending on question type
  selectedOptionId: uuid('selected_option_id').references(() => options.id),
  shortAnswerText: text('short_answer_text'),
  trueFalseAnswer: boolean('true_false_answer'),
});


// --- RELATIONS ---
// Define how tables are related for easier querying with Drizzle ORM
// For User -> to see all sessions they've taken
export const usersRelations = relations(users, ({ many }) => ({
    sessions: many(testSessions),
}));

export const testsRelations = relations(tests, ({ one, many }) => ({
    creator: one(users, {
        fields: [tests.creatorId],
        references: [users.id],
    }),
    questions: many(questions),
    sessions: many(testSessions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
    test: one(tests, {
        fields: [questions.testId],
        references: [tests.id],
    }),
    options: many(options),
    responses: many(responses),
}));

export const optionsRelations = relations(options, ({ one, many }) => ({
    question: one(questions, {
        fields: [options.questionId],
        references: [questions.id],
    }),
    responses: many(responses),
}));

// --- NEW RELATIONS ---
export const testSessionsRelations = relations(testSessions, ({ one, many }) => ({
    test: one(tests, {
        fields: [testSessions.testId],
        references: [tests.id],
    }),
    taker: one(users, {
        fields: [testSessions.takerId],
        references: [users.id],
    }),
    responses: many(responses),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
    session: one(testSessions, {
        fields: [responses.sessionId],
        references: [testSessions.id],
    }),
    question: one(questions, {
        fields: [responses.questionId],
        references: [questions.id],
    }),
    selectedOption: one(options, {
        fields: [responses.selectedOptionId],
        references: [options.id],
    }),
}));

