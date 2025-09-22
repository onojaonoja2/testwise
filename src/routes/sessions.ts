import { Elysia, t } from 'elysia';
import { db } from '../db';
import { testSessions, responses, questions, options, tests } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';

// --- Validation Schemas (DTOs) ---
const submitResponseDto = t.Object({
  questionId: t.String({ format: 'uuid' }),
  // Only one of the following should be provided per response
  selectedOptionId: t.Optional(t.String({ format: 'uuid' })),
  shortAnswerText: t.Optional(t.String()),
  trueFalseAnswer: t.Optional(t.Boolean()),
});

const submitSessionDto = t.Object({
  responses: t.Array(submitResponseDto),
});

// --- Session Routes ---
export const sessionRoutes = new Elysia({ prefix: '/api/sessions' })
  // Guard: Ensure a user is logged in for all session actions
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { success: false, message: 'Unauthorized' };
    }
  })
  
  // --- NEW: GET /api/sessions/:sessionId (Resume a session) ---
  .get(
    '/:sessionId',
    async ({ user, params, set }) => {
      const { sessionId } = params;

      // 1. Find the session and verify ownership and status
      const session = await db.query.testSessions.findFirst({
        where: and(
          eq(testSessions.id, sessionId),
          eq(testSessions.takerId, user!.id),
          eq(testSessions.status, 'In Progress')
        ),
        columns: { testId: true }
      });

      if (!session) {
        set.status = 404;
        return { success: false, message: 'In-progress session not found for this user.' };
      }

      // 2. Fetch the test data for the taker, excluding correct answers
      const testForTaker = await db.query.tests.findFirst({
        where: eq(tests.id, session.testId),
        columns: { id: true, title: true, description: true, durationMinutes: true },
        with: {
          questions: {
            columns: { id: true, questionText: true, questionType: true, order: true },
            with: { options: { columns: { id: true, optionText: true } } },
            orderBy: (questions, { asc }) => [asc(questions.order)],
          },
        },
      });
      
      if (!testForTaker) {
          set.status = 404;
          return { success: false, message: 'Associated test not found.' };
      }

      return { success: true, data: { test: testForTaker } };
    },
    { params: t.Object({ sessionId: t.String({ format: 'uuid' }) }) }
  )

  .post(
    '/:sessionId/submit',
    async ({ user, params, body, set }) => {
      const { sessionId } = params;
      const userResponses = body.responses;

       // --- ADD THIS DIAGNOSTIC LOG ---
      console.log('--- SUBMIT DIAGNOSTIC ---');
      console.log('Session ID from URL:', sessionId);
      console.log('User ID from Token:', user!.id);
      console.log('User Role from Token:', user!.role);
      // ---------------------------------

      try {
        // --- Transaction for Scoring and Submission ---
        const { score, totalQuestions } = await db.transaction(async (tx) => {
          // 1. Verify session exists, is 'In Progress', and belongs to the user
          const session = await tx.query.testSessions.findFirst({
            where: and(
              eq(testSessions.id, sessionId),
              eq(testSessions.takerId, user!.id),
              eq(testSessions.status, 'In Progress')
            ),
            columns: { testId: true }
          });

          if (!session) {
            throw new Error('Session not found, is not in progress, or you do not have permission to submit to it.');
          }

          // 2. Insert all user responses
          if (userResponses.length > 0) {
            await tx.insert(responses).values(
              userResponses.map((r) => ({
                sessionId,
                questionId: r.questionId,
                selectedOptionId: r.selectedOptionId,
                shortAnswerText: r.shortAnswerText,
                trueFalseAnswer: r.trueFalseAnswer,
              }))
            );
          }

          // 3. Get all questions and their correct answers for the entire test
          const correctAnswers = await tx.query.questions.findMany({
            where: eq(questions.testId, session.testId),
            columns: { id: true, questionType: true },
            with: {
              options: {
                where: eq(options.isCorrect, true),
                columns: { id: true }
              }
            }
          });

          // 4. Score the test
          let correctCount = 0;
          for (const correctAnswer of correctAnswers) {
            const userResponse = userResponses.find(r => r.questionId === correctAnswer.id);
            if (!userResponse) continue; // User skipped the question

            if (correctAnswer.questionType === 'Multiple Choice') {
              // Assumes only one correct option per question
              const correctOptionId = correctAnswer.options[0]?.id;
              if (correctOptionId && userResponse.selectedOptionId === correctOptionId) {
                correctCount++;
              }
            }
            // Note: Auto-grading for True/False and Short Answer is not implemented here
            // but could be added with more complex logic.
          }
          
          const totalQuestions = correctAnswers.length;
          const finalScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

          // 5. Update the session to 'Completed' with the score
          await tx
            .update(testSessions)
            .set({
              status: 'Completed',
              completedAt: new Date(),
              score: finalScore.toFixed(2),
            })
            .where(eq(testSessions.id, sessionId));

          return { score: finalScore, totalQuestions };
        });

        return {
          success: true,
          message: 'Test submitted successfully.',
          data: {
            score: score.toFixed(2),
            totalQuestions,
          },
        };

      } catch (error: any) {
        if (error.message.includes('Session not found')) {
            set.status = 404;
        } else {
            set.status = 500;
        }
        return { success: false, message: error.message || 'Failed to submit the test.' };
      }
    },
    {
      params: t.Object({ sessionId: t.String({ format: 'uuid' }) }),
      body: submitSessionDto,
    }
  );