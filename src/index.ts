import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { db } from './db';
import { auth } from './auth'; // <-- Import the new consolidated plugin
import { userRoutes } from './routes/users';

const app = new Elysia()
  .use(swagger())
  .decorate('db', db)
  // Apply the single auth plugin. It provides context and the auth routes.
  .use(auth)
  // Apply the user routes, which will now have access to the auth context.
  .use(userRoutes)
  .get('/', () => ({ status: 'ok' }))
  .listen(3000);

console.log(`🦊 Testwise API is running at http://${app.server?.hostname}:${app.server?.port}`);