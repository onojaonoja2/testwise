import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { db } from './db';
import { auth } from './auth';
import { userRoutes } from './routes/users';
import { testRoutes } from './routes/tests'; // <-- Import test routes

const app = new Elysia()
  .use(swagger())
  .decorate('db', db)
  .use(auth)
  .use(userRoutes)
  .use(testRoutes) // <-- Use the test routes
  .get('/', () => ({ status: 'ok' }))
  .listen(3000);

console.log(`🦊 Testwise API is running at http://${app.server?.hostname}:${app.server?.port}`);