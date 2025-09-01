'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Clock, Users } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If user is authenticated, show them the dashboard content
    // If not authenticated, show the landing page
    if (status === 'authenticated') {
      // User is logged in, redirect to dashboard or show dashboard content
      // For now, let's show dashboard content here
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  // If user is authenticated, show dashboard
  if (status === 'authenticated') {
    return <DashboardContent session={session} />
  }

  // Show landing page for unauthenticated users
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

// Dashboard component for authenticated users
function DashboardContent({ session }: { session: any }) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">TestWise</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/tests/create">
                  <Button variant="ghost">Create Test</Button>
                </Link>
                <Link href="/tests">
                  <Button variant="ghost">My Tests</Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {session?.user?.name}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-gray-500">Welcome back! Here's an overview of your tests</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Tests created</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Across all tests</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Link href="/tests/create">
                <Button className="w-full" variant="outline">
                  Create New Test
                </Button>
              </Link>
              <Link href="/tests">
                <Button className="w-full" variant="outline">
                  View All Tests
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
