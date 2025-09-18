import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { cookie } from '@elysiajs/cookie';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

const loginDto = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String(),
});

const registerDto = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8 }),
});

// The single, unified authentication plugin
export const auth = (app: Elysia) =>
  app
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET!,
        exp: '7d',
      })
    )
    .use(cookie())
    // This decorator provides a verified user object to any route that uses it.
    .derive(async ({ jwt, cookie }) => {
      const authCookie = cookie.auth;
      if (!authCookie) return { user: null };

      // --- THE FIX IS HERE ---
      // We must verify the `.value` of the cookie, not the whole object.
      const profile = await jwt.verify(authCookie.value);
      if (!profile) return { user: null };

      // Re-fetch user from DB to ensure they are still valid
      const user = await db.query.users.findFirst({
        where: eq(users.id, profile.userId as string),
        columns: { id: true, email: true, role: true },
      });

      return { user }; // Provide the user object to the context
    })
    // Login Route
    .post(
      '/api/auth/login',
      async ({ db, jwt, cookie, body, set }) => {
        const user = await db.query.users.findFirst({
          where: eq(users.email, body.email),
        });

        if (!user) {
          set.status = 401;
          return { success: false, message: 'Invalid credentials' };
        }

        const isPasswordValid = await Bun.password.verify(
          body.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          set.status = 401;
          return { success: false, message: 'Invalid credentials' };
        }

        const token = await jwt.sign({
          userId: user.id,
          role: user.role,
        });

        cookie.auth.set({
          value: token,
          httpOnly: true,
          maxAge: 7 * 86400,
          path: '/',
          sameSite: 'strict',
        });

        return { success: true, message: 'Login successful' };
      },
      { body: loginDto }
    )
    // Register Route
    .post(
      '/api/auth/register',
      async ({ db, body, set }) => {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, body.email),
        });

        if (existingUser) {
          set.status = 409;
          return {
            success: false,
            message: 'A user with this email already exists.',
          };
        }

        const hashedPassword = await Bun.password.hash(body.password, {
          algorithm: 'bcrypt',
          cost: 10,
        });

        const newUser = await db
          .insert(users)
          .values({
            email: body.email,
            passwordHash: hashedPassword,
            role: 'Test Creator',
          })
          .returning({ id: users.id, email: users.email });

        set.status = 201;
        return {
          success: true,
          message: 'User registered successfully.',
          data: newUser[0],
        };
      },
      { body: registerDto }
    );