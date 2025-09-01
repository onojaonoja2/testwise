'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

// Define types for our data
interface Question {
  id: string;
  text: string;
  type: string;
  options: any;
}

interface Test {
  id: string;
  title: string;
  duration: number;
  questions: Question[];
}

export default function TakeTestPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const testId = params.testId as string

  const [test, setTest] = useState<Test | null>(null)
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const visibilityChangeRef = useRef<() => void>()
  const fullscreenChangeRef = useRef<() => void>()

  const enterFullScreen = () => {
    const elem = document.documentElement
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
      })
    }
  }

  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      submitTest('terminated')
    }
  }

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      submitTest('terminated')
    }
  }

  useEffect(() => {
    if (testId) {
      const startTest = async () => {
        try {
          const res = await fetch(`/api/tests/${testId}/start`, {
            method: 'POST',
          })
          if (!res.ok) {
            const { message } = await res.json()
            throw new Error(message)
          }
          const { test: testData, attempt } = await res.json()
          setTest(testData)
          setAttemptId(attempt.id)
          setTimeLeft(testData.duration * 60)
          setIsLoading(false)
          enterFullScreen()
        } catch (err: any) {
          setError(err.message)
          setIsLoading(false)
        }
      }
      startTest()
    }
  }, [testId])

  useEffect(() => {
    if (timeLeft === null) return

    if (timeLeft <= 0) {
      submitTest('timed-out')
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null))
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timeLeft])

  useEffect(() => {
    visibilityChangeRef.current = handleVisibilityChange
    fullscreenChangeRef.current = handleFullscreenChange

    document.addEventListener('visibilitychange', visibilityChangeRef.current)
    document.addEventListener('fullscreenchange', fullscreenChangeRef.current)

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
      submitTest('terminated')
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', visibilityChangeRef.current!)
      document.removeEventListener('fullscreenchange', fullscreenChangeRef.current!)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (timerRef.current) clearInterval(timerRef.current)
      exitFullScreen()
    }
  }, [])

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const submitTest = async (status: 'completed' | 'terminated' | 'timed-out') => {
    if (timerRef.current) clearInterval(timerRef.current)
    
    if (!attemptId) return

    await fetch(`/api/tests/${testId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId, answers, status }),
    })

    exitFullScreen()
    router.push(`/dashboard/tests/results/${attemptId}`)
  }

  if (isLoading) return <div>Loading test...</div>
  if (error) return <div>Error: {error}</div>
  if (!test) return <div>Test not found.</div>

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div 
      className="min-h-screen bg-gray-100 p-8"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: 'none' }}
    >
      <div className="fixed top-4 right-4">
        <Badge variant="secondary" className="text-lg">
          Time Left: {timeLeft !== null ? formatTime(timeLeft) : '...'}
        </Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{test.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {test.questions.map((q, index) => (
              <div key={q.id}>
                <p className="font-semibold">{index + 1}. {q.text}</p>
                {q.type === 'multiple-choice' ? (
                  <RadioGroup onValueChange={(value) => handleAnswerChange(q.id, value)}>
                    {q.options.map((option: string, i: number) => (
                      <div key={i} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${q.id}-${i}`} />
                        <Label htmlFor={`${q.id}-${i}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Textarea
                    placeholder="Your answer..."
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <Button onClick={() => submitTest('completed')} className="mt-8 w-full">
            Submit Test
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
