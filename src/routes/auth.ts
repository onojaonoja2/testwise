import { Elysia, t } from 'elysia';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { jwt } from '@elysiajs/jwt'; // <-- Import JWT plugin

// --- DTOs (Data Transfer Objects) for validation ---

const registerUserDto = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8 }),
});

const loginUserDto = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String(),
});

// --- Auth Routes ---

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  // Use the JWT plugin within this route group
  .use(
    jwt({
      name: 'jwt', // The name to access jwt functions (e.g., jwt.sign)
      secret: process.env.JWT_SECRET!, // Load the secret from .env
      exp: '7d', // Token expiration time (e.g., 7 days)
    })
  )
  .post(
    '/register',
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
        .returning({
          id: users.id,
          email: users.email,
          role: users.role,
        });

      set.status = 201;
      return {
        success: true,
        message: 'User registered successfully.',
        data: newUser[0],
      };
    },
    {
      body: registerUserDto,
    }
  )
  // --- NEW: Login Endpoint ---
  .post(
    '/login',
    async ({ db, jwt, body, set, cookie }) => {
      // 1. Find the user by email
      const user = await db.query.users.findFirst({
        where: eq(users.email, body.email),
      });

      if (!user) {
        set.status = 401; // Unauthorized
        return { success: false, message: 'Invalid credentials' };
      }

      // 2. Verify the password
      const isPasswordValid = await Bun.password.verify(
        body.password,
        user.passwordHash
      );

      if (!isPasswordValid) {
        set.status = 401; // Unauthorized
        return { success: false, message: 'Invalid credentials' };
      }

      // 3. Generate JWT
      const token = await jwt.sign({
        userId: user.id,
        role: user.role,
      });
      
      // Set the token in an HTTP-Only cookie for security
      cookie.auth.set({
        value: token,
        httpOnly: true,
        maxAge: 7 * 86400, // 7 days in seconds
        path: '/',
      });

      set.status = 200;
      return {
        success: true,
        message: 'Login successful.',
        data: {
          token: token,
        },
      };
    },
    {
      body: loginUserDto, // Apply validation for login request
    }
  );