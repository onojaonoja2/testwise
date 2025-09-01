'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Answer {
  question: { text: string };
  text: string;
  isCorrect: boolean | null;
}

interface Attempt {
  id: string;
  score: number | null;
  status: string;
  test: { title: string };
  taker: { name: string };
  answers: Answer[];
}

export default function TestResultPage() {
  const params = useParams()
  const attemptId = params.attemptId as string
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (attemptId) {
      const fetchResult = async () => {
        try {
          const res = await fetch(`/api/results/${attemptId}`)
          if (!res.ok) {
            throw new Error('Failed to fetch results')
          }
          const data = await res.json()
          setAttempt(data)
        } catch (err: any) {
          setError(err.message)
        } finally {
          setIsLoading(false)
        }
      }
      fetchResult()
    }
  }, [attemptId])

  if (isLoading) return <div>Loading results...</div>
  if (error) return <div>Error: {error}</div>
  if (!attempt) return <div>Results not found.</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Results: {attempt.test.title}</CardTitle>
          <CardDescription>
            Results for {attempt.taker.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-lg">Score: {attempt.score ?? 'Not graded'}</p>
              <p>Status: <Badge>{attempt.status}</Badge></p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Your Answers</h3>
            {attempt.answers.map((answer, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <p className="font-semibold">{answer.question.text}</p>
                  <p>Your answer: {answer.text}</p>
                  {answer.isCorrect !== null && (
                    <p>Result: {answer.isCorrect ? 'Correct' : 'Incorrect'}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
