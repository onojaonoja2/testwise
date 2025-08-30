# TestWise

A secure, time-limited test application built with Next.js, Prisma, and SQLite.

## Features

- 🔐 Secure user authentication
- 📝 Create and manage time-limited tests
- 🎯 Multiple question types support
- ⏱️ Automatic test scheduling
- 📊 Test results and analytics

## Tech Stack

- **Framework:** Next.js 14
- **Database:** SQLite (via Prisma)
- **Authentication:** NextAuth.js
- **UI Components:** Shadcn/ui
- **Styling:** Tailwind CSS
- **Language:** TypeScript

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/testwise.git
cd testwise
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

4. Initialize the database:

```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── (auth)/         # Authentication routes
│   ├── (dashboard)/    # Dashboard routes
│   └── api/            # API routes
├── components/         # UI components
├── lib/                # Utility functions
├── prisma/            # Database schema and migrations
└── public/            # Static assets
```

## API Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/tests` - Create a new test
- `GET /api/tests` - Get all tests for the authenticated user
- `GET /api/tests/[id]` - Get a specific test
- `PUT /api/tests/[id]` - Update a test
- `DELETE /api/tests/[id]` - Delete a test

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
