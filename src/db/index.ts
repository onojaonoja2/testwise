import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

// Create the client for the query builder
const client = postgres(connectionString);

// Create the Drizzle instance
export const db = drizzle(client, { schema });