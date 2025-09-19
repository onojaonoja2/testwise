import { Elysia, t } from 'elysia';
import { db } from '../db';
import { tests, questions, options, questionTypeEnum } from '../db/schema';
import { eq, and } from 'drizzle-orm';

// --- Validation Schemas (DTOs) ---
const questionTypeLiterals = questionTypeEnum.enumValues.map((value) => t.Literal(value));

const createOptionDto = t.Object({
  optionText: t.String(),
  isCorrect: t.Boolean(),
});

const createQuestionDto = t.Object({
  questionText: t.String(),
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

// We can reuse createTestDto for updates, let's give it a clearer name.
const upsertTestDto = createTestDto;

// --- Test Routes ---
export const testRoutes = new Elysia({ prefix: '/api/tests' })
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { success: false, message: 'Unauthorized' };
    }
    if (!['Test Creator', 'Sub Admin', 'System Admin'].includes(user.role)) {
      set.status = 403;
      return { success: false, message: 'Insufficient permissions' };
    }
  })
  .post(
    '/',
    async ({ user, body, set }) => {
      const { title, description, durationMinutes, questions: questionData } = body;
      try {
        const newTest = await db.transaction(async (tx) => {
          const [test] = await tx.insert(tests).values({ title, description, durationMinutes, creatorId: user!.id }).returning();
          for (const q of questionData) {
            const [question] = await tx.insert(questions).values({ testId: test.id, questionText: q.questionText, questionType: q.questionType, order: q.order }).returning();
            if (q.questionType === 'Multiple Choice' && q.options && q.options.length > 0) {
              await tx.insert(options).values(q.options.map((opt) => ({ questionId: question.id, optionText: opt.optionText, isCorrect: opt.isCorrect })));
            }
          }
          return test;
        });
        set.status = 201;
        return { success: true, message: 'Test created successfully.', data: { testId: newTest.id } };
      } catch (error) {
        console.error('Failed to create test:', error);
        set.status = 500;
        return { success: false, message: 'Failed to create the test.' };
      }
    },
    { body: createTestDto }
  )
  .get('/', async ({ user }) => {
    const userTests = await db.query.tests.findMany({
      where: eq(tests.creatorId, user!.id),
      columns: { id: true, title: true, description: true, status: true, durationMinutes: true, createdAt: true },
      orderBy: (tests, { desc }) => [desc(tests.createdAt)],
    });
    return { success: true, message: 'Tests retrieved successfully.', data: userTests };
  })
  .get(
    '/:id',
    async ({ user, params, set }) => {
      const { id } = params;
      const test = await db.query.tests.findFirst({
        where: and(eq(tests.id, id), eq(tests.creatorId, user!.id)),
        with: { questions: { with: { options: true }, orderBy: (questions, { asc }) => [asc(questions.order)] } },
      });
      if (!test) {
        set.status = 404;
        return { success: false, message: 'Test not found or you do not have permission to view it.' };
      }
      return { success: true, message: 'Test details retrieved successfully.', data: test };
    },
    { params: t.Object({ id: t.String({ format: 'uuid' }) }) }
  ) // <-- Semicolon removed from here to continue the chain
  .put(
    '/:id',
    async ({ user, params, body, set }) => {
      const { id } = params;
      const { title, description, durationMinutes, questions: questionData } = body;
      try {
        await db.transaction(async (tx) => {
          const [existingTest] = await tx.select({ id: tests.id }).from(tests).where(and(eq(tests.id, id), eq(tests.creatorId, user!.id)));
          if (!existingTest) {
            throw new Error('Test not found or permission denied');
          }
          await tx.update(tests).set({ title, description, durationMinutes, updatedAt: new Date() }).where(eq(tests.id, id));
          await tx.delete(questions).where(eq(questions.testId, id));
          for (const q of questionData) {
            const [question] = await tx.insert(questions).values({ testId: id, questionText: q.questionText, questionType: q.questionType, order: q.order }).returning();
            if (q.questionType === 'Multiple Choice' && q.options && q.options.length > 0) {
              await tx.insert(options).values(q.options.map((opt) => ({ questionId: question.id, optionText: opt.optionText, isCorrect: opt.isCorrect })));
            }
          }
        });
        return { success: true, message: 'Test updated successfully.' };
      } catch (error: any) {
        if (error.message.includes('Test not found')) {
          set.status = 404;
          return { success: false, message: error.message };
        }
        console.error('Failed to update test:', error);
        set.status = 500;
        return { success: false, message: 'Failed to update the test.' };
      }
    },
    { params: t.Object({ id: t.String({ format: 'uuid' }) }), body: upsertTestDto }
  )
  .delete(
    '/:id',
    async ({ user, params, set }) => {
      const { id } = params;
      const [deletedTest] = await db.delete(tests).where(and(eq(tests.id, id), eq(tests.creatorId, user!.id))).returning({ id: tests.id });
      if (!deletedTest) {
        set.status = 404;
        return { success: false, message: 'Test not found or permission denied.' };
      }
      return { success: true, message: 'Test deleted successfully.' };
    },
    { params: t.Object({ id: t.String({ format: 'uuid' }) }) }
  ); 