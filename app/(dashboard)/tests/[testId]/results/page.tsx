'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface Attempt {
  id: string;
  taker: { name: string };
  score: number | null;
  status: string;
}

export default function TestAttemptsPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.testId as string
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (testId) {
      const fetchAttempts = async () => {
        try {
          const res = await fetch(`/api/tests/${testId}/results`)
          if (!res.ok) {
            throw new Error('Failed to fetch attempts')
          }
          const data = await res.json()
          setAttempts(data)
        } catch (err) {
          setError((err as Error).message)
        } finally {
          setIsLoading(false)
        }
      }
      fetchAttempts()
    }
  }, [testId])

  if (isLoading) return <div>Loading attempts...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Taker</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell>{attempt.taker.name}</TableCell>
                  <TableCell>{attempt.score ?? 'Not graded'}</TableCell>
                  <TableCell>{attempt.status}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/tests/results/${attempt.id}`)}>View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
