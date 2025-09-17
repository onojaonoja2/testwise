import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import 'dotenv/config';

console.log("Starting migration...");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

async function main() {
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

main();