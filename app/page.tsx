import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold">TestWise</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Create Secure Time-Limited Tests
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              TestWise helps educators and organizations create and manage secure,
              time-limited tests with ease. Perfect for assessments, quizzes, and
              examinations.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg">Create Your First Test</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">Sign In</Button>
              </Link>
            </div>
          </div>

          <div className="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <h3 className="mt-3 text-lg font-semibold">Secure Testing</h3>
              <p className="mt-2 text-gray-600">
                Create tests with advanced security features to maintain integrity
              </p>
            </div>
            <div className="text-center">
              <h3 className="mt-3 text-lg font-semibold">Time Management</h3>
              <p className="mt-2 text-gray-600">
                Set precise time limits and schedules for your assessments
              </p>
            </div>
            <div className="text-center">
              <h3 className="mt-3 text-lg font-semibold">Detailed Analytics</h3>
              <p className="mt-2 text-gray-600">
                Get comprehensive insights into test performance and results
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} TestWise. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
