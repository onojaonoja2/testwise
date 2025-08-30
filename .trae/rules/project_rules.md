# TestWise: Trae IDE Project Rules

This document outlines the project rules and standards for the development of the TestWise application. Adherence to these rules is mandatory to ensure a consistent, maintainable, and secure codebase.

## 1\. General Principles

- **Modularity:** The codebase must be modular and well-structured, as per NFR7. Components and functions should be designed for reusability and easy maintenance.
- **Documentation:** All major components, functions, and non-trivial logic must be documented using JSDoc-style comments.
- **Security First:** All development must prioritize security. This includes following secure coding practices, validating all user input, and ensuring data encryption and session-based URLs.

## 2\. Technology Stack

- **Frontend:** Next.js 15.5.2.
- **Backend:** Next.js API Routes (Serverless Functions).
- **Database:** Prisma ORM, with SQLite for local development and Turso with `@libsql/client` for production.
- **Authentication:** NextAuth.js with Prisma Adapter.
- **UI:** Shadcn/ui, Tailwind CSS, and Radix UI.
- **Deployment:** Vercel.

## 3\. Naming Conventions

- **Files:** Use `kebab-case` for all file and folder names (e.g., `user-profile.tsx`, `api/tests.ts`).
- **Components:** Use `PascalCase` for React components (e.g., `Timer.tsx`, `TestPage.tsx`).
- **Variables:** Use `camelCase` for variables and function names (e.g., `testDurationMinutes`, `getTestById`).
- **API Routes:** RESTful conventions should be strictly followed (e.g., `POST /api/tests`, `GET /api/tests/{testId}`). For API routes requiring a specific resource, use dynamic route segments (e.g., `[testId]`) to ensure clear, resource-based URL structures.

## 4\. Code Standards & Practices

- **TypeScript:** All new code must be written in TypeScript.
- **Strict Mode:** The `tsconfig.json` should have `strict` mode enabled.
- **Linting:** The project must pass all ESLint and Prettier checks before a commit is pushed. Developers must use the configured rules to format their code.
- **Error Handling:** Implement robust error handling on both the frontend and backend. API routes must return appropriate HTTP status codes and a descriptive JSON body for errors. The recommended format is `{ 'error': 'A brief, human-readable error message.', 'details': 'More specific technical details or validation failures.' }`.
- **Data Validation:** All data received from the client-side, including but not limited to request bodies, query parameters, and headers, must be validated on the backend before being processed. Use Zod for schema validation.

## 5\. Architectural Rules

- **API Routes:** Each API route should be a single, focused microservice. Avoid placing unrelated logic within the same API file.
- **Database Access:** All database interactions must be done via the Prisma ORM. Do not use raw SQL queries unless absolutely necessary and approved by the project lead.
- **Frontend Logic:** The "secure test" logic (full-screen, focus-monitoring, timer) is a critical frontend component and must be robustly handled on the frontend. To prevent data loss, the test-taker's state (answers and current time) must be automatically persisted to the backend every 30 seconds and upon any significant user action (e.g., changing an answer).

## 6\. Development Workflow

- **Git:** All code must be managed in Git.
- **Branching:** Use a feature branch workflow. All work should be done in a new branch, named descriptively (e.g., `feat/add-timer-component`, `fix/fix-auth-bug`).
- **Pull Requests (PRs):** All feature branches must be merged into the main branch via a pull request. PRs require at least one code review from another developer before being merged.
- **Testing:** All pull requests must include relevant unit and integration tests, and the CI/CD pipeline must pass these tests before a PR can be merged to the main branch.

## 7\. Security Rules

- **Authentication:** All test creation and result viewing endpoints must be protected by `NextAuth.js`.
- **Authorization:** Ensure that a test creator can only access their own tests and test-taker results.
- **Sensitive Data:** Never expose sensitive data (e.g., database connection strings) on the frontend. Use environment variables.
- **Test URL Security:** Ensure the unique test URL contains a non-guessable identifier.