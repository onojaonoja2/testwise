import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors'; 
import { db } from './db';
import { auth } from './auth';
import { userRoutes } from './routes/users';
import { testRoutes } from './routes/tests'; // <-- Import test routes
import { sessionRoutes } from './routes/sessions';

const app = new Elysia()
  .use(
    cors({
      origin: 'http://localhost:5173', // <-- Allow your frontend origin
      credentials: true, // <-- IMPORTANT: Allow cookies to be sent
      allowedHeaders: ['Content-Type'], // Specify allowed headers
    })
  )
  .use(swagger())
  .decorate('db', db)
  .use(auth)
  .use(userRoutes)
  .use(testRoutes) // <-- Use the test routes
  .use(sessionRoutes) // <-- Use the session routes
  .get('/', () => ({ status: 'ok' }))
  .listen(3000);

console.log(`🦊 Testwise API is running at http://${app.server?.hostname}:${app.server?.port}`);