import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request, { params }: { params: { testId: string } }) {
  try {
    const { attemptId, answers, status } = await req.json()

    if (!attemptId || !answers || !status) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { test: { include: { questions: true } } },
    })

    if (!attempt) {
      return NextResponse.json({ message: 'Attempt not found' }, { status: 404 })
    }

    let score = 0
    const answerRecords = []

    for (const question of attempt.test.questions) {
      const userAnswer = answers[question.id]
      if (userAnswer) {
        let isCorrect = false
        if (question.type === 'multiple-choice') {
          isCorrect = userAnswer === question.answer
        }
        
        if (isCorrect) {
          score += question.points
        }

        answerRecords.push({
          text: userAnswer,
          isCorrect,
          points: isCorrect ? question.points : 0,
          questionId: question.id,
          attemptId: attemptId,
        })
      }
    }

    await prisma.answer.createMany({
      data: answerRecords,
    })

    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        endTime: new Date(),
        score,
        status,
      },
    })

    return NextResponse.json({ message: 'Test submitted successfully' })
  } catch (error) {
    console.error('Failed to submit test:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
