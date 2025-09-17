import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';

export const authPlugin = new Elysia({ name: 'auth.plugin' })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET!,
    })
  )
  // This is the core logic. It runs on every request.
  // It verifies the JWT from the cookie and adds the payload (or null) to the context.
  .derive(async ({ jwt, cookie }) => {
    const profile = await jwt.verify(cookie.auth.value);
    return {
      profile: profile || null,
    };
  });