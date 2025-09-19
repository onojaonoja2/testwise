import { Elysia, t } from 'elysia';
import { db } from '../db';
// Import the actual enum object, not just the tables
import { tests, questions, options, questionTypeEnum } from '../db/schema';

// --- Validation Schemas (DTOs) ---

// --- THIS IS THE FIX ---
// Access the `.enumValues` property of the exported enum object. This is a string array.
const questionTypeLiterals = questionTypeEnum.enumValues.map((value) => t.Literal(value));

const createOptionDto = t.Object({
  optionText: t.String(),
  isCorrect: t.Boolean(),
});

const createQuestionDto = t.Object({
  questionText: t.String(),
  // Use the correctly generated Union type
  questionType: t.Union(questionTypeLiterals),
  order: t.Integer(),
  options: t.Optional(t.Array(createOptionDto)),
});

const createTestDto = t.Object({
  title: t.String({ minLength: 3 }),
  description: t.Optional(t.String()),
  durationMinutes: t.Integer({ minimum: 1 }),
  questions: t.Array(createQuestionDto, { minItems: 1 }),
});

// --- Test Routes ---

export const testRoutes = new Elysia({ prefix: '/api/tests' })
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { success: false, message: 'Unauthorized' };
    }
    if (!['Test Creator', 'Sub Admin', 'System Admin'].includes(user.role)) {
      set.status = 403; // Forbidden
      return { success: false, message: 'Insufficient permissions' };
    }
  })
  .post(
    '/',
    async ({ user, body, set }) => {
      const { title, description, durationMinutes, questions: questionData } = body;

      try {
        const newTest = await db.transaction(async (tx) => {
          const [test] = await tx
            .insert(tests)
            .values({
              title,
              description,
              durationMinutes,
              creatorId: user!.id,
            })
            .returning();

          for (const q of questionData) {
            const [question] = await tx
              .insert(questions)
              .values({
                testId: test.id,
                questionText: q.questionText,
                questionType: q.questionType,
                order: q.order,
              })
              .returning();

            if (q.questionType === 'Multiple Choice' && q.options && q.options.length > 0) {
              await tx.insert(options).values(
                q.options.map((opt) => ({
                  questionId: question.id,
                  optionText: opt.optionText,
                  isCorrect: opt.isCorrect,
                }))
              );
            }
          }
          return test;
        });

        set.status = 201;
        return {
          success: true,
          message: 'Test created successfully.',
          data: { testId: newTest.id },
        };
      } catch (error) {
        console.error('Failed to create test:', error);
        set.status = 500;
        return { success: false, message: 'Failed to create the test.' };
      }
    },
    { body: createTestDto }
  );