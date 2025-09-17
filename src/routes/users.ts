import { Elysia } from 'elysia';

export const userRoutes = new Elysia({ prefix: '/api/users' })
  // This hook now acts as a guard for all routes defined in this module.
  .onBeforeHandle(({ profile, set }) => {
    if (!profile) {
      set.status = 401; // Unauthorized
      return {
        success: false,
        message: 'Unauthorized. Please login.',
      };
    }
  })
  .get('/me', async ({ db, set, profile }) => {
    // Because of the guard above, we can be certain that `profile` is not null here.
    const { userId } = profile;

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      set.status = 404; // Should be rare, but good to handle
      return {
        success: false,
        message: 'User not found.',
      };
    }

    return {
      success: true,
      message: 'Profile fetched successfully.',
      data: user,
    };
  });