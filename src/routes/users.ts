import { Elysia, t } from 'elysia'; // <-- Make sure 't' is imported

// This is a self-contained instance.
// We are using the `prefix` option instead of the problematic `.group()` method.
export const userRoutes = new Elysia({ prefix: '/api/users' })
  // The guard checks for the `user` object provided by the auth plugin.
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { success: false, message: 'Unauthorized' };
    }
  })
  .get(
    '/me',
    ({ user }) => {
      // The `user` object is guaranteed to exist here because of the guard.
      return {
        success: true,
        message: 'Profile fetched successfully.',
        data: user,
      };
    },
    // --- THIS IS THE CORRECTED SCHEMA ---
    {
      response: {
        // Correct schema for the 200 OK response
        200: t.Object({
          success: t.Boolean(),
          message: t.String(),
          data: t.Object({
            id: t.String(),
            email: t.String(),
            role: t.String(),
          }),
        }),
        // Correct schema for the 401 Unauthorized response
        401: t.Object({
          success: t.Boolean(),
          message: t.String(),
        }),
      },
    }
  );