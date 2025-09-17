import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { db } from './db';
import { authPlugin } from './auth/auth.plugin';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';

const app = new Elysia()
  .use(swagger())
  .decorate('db', db)
  // The auth plugin adds the `profile` context to all subsequent routes.
  .use(authPlugin)
  .get('/', () => ({ status: 'ok', message: 'Welcome to Testwise API' }))
  // These routes can now use the context provided by authPlugin.
  .use(authRoutes)
  .use(userRoutes) // <-- Now we can use it directly and cleanly.

  .listen(3000);

console.log(
  `🦊 Testwise API is running at http://${app.server?.hostname}:${app.server?.port}`
);
console.log(
  `📄 Swagger docs available at http://${app.server?.hostname}:${app.server?.port}/swagger`
);