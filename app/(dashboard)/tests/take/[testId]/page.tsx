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
interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  options: Option[];
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
  const {  } = useSession()
  const testId = params.testId as string

  const [test, setTest] = useState<Test | null>(null)
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testStarted, setTestStarted] = useState(false)

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

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      submitTest('terminated')
    }
  }, [submitTest])

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement) {
      submitTest('terminated')
    }
  }, [submitTest])

  useEffect(() => {
    if (testId) {
      const fetchTest = async () => {
        try {
          const res = await fetch(`/api/tests/${testId}`)
          if (!res.ok) {
            const { message } = await res.json()
            throw new Error(message)
          }
          const testData = await res.json()
          setTest(testData)
        } catch (err) {
          setError((err as Error).message)
        } finally {
          setIsLoading(false)
        }
      }
      fetchTest()
    }
  }, [testId])

  const handleStartTest = async () => {
    try {
      const res = await fetch(`/api/tests/${testId}/start`, {
        method: 'POST',
      });
      if (!res.ok) {
        const { message } = await res.json()
        throw new Error(message)
      }
      const { attempt, test: testData } = await res.json()
      setAttemptId(attempt.id)
      setTestStarted(true)
      setTimeLeft(testData.duration * 60)
      enterFullScreen()
    } catch (err) {
      setError((err as Error).message)
    }
  };

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
  }, [timeLeft, submitTest])

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
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (timerRef.current) clearInterval(timerRef.current)
      exitFullScreen()
    }
  }, [handleFullscreenChange, handleVisibilityChange, submitTest])

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const submitTest = useCallback(async (status: 'completed' | 'terminated' | 'timed-out') => {
    if (timerRef.current) clearInterval(timerRef.current)
    
    if (!attemptId) return

    await fetch(`/api/tests/${testId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId, answers, status }),
    })

    exitFullScreen()
    router.push(`/dashboard/tests/results/${attemptId}`)
  }, [attemptId, answers, router, testId])

  if (isLoading) return <div>Loading test...</div>
  if (error) return <div>Error: {error}</div>
  if (!test) return <div>Test not found.</div>

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>{test.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You are about to start the test. Once you begin, you will enter full-screen mode and will not be able to exit without terminating the test.</p>
            <p className="mb-4"><strong>Duration:</strong> {test.duration} minutes</p>
            <Button onClick={handleStartTest} className="w-full">
              Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
                    {q.options.map((option: Option, i: number) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={`${q.id}-${i}`} />
                        <Label htmlFor={`${q.id}-${i}`}>{option.text}</Label>
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
