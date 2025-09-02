import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const attemptId = req.nextUrl.pathname.split('/').pop()
      const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        test: { select: { title: true, creatorId: true } },
        taker: { select: { name: true, id: true } },
        answers: {
          include: {
            question: { select: { text: true } },
          },
        },
      },
    })

    if (!attempt) {
      return NextResponse.json({ message: 'Attempt not found' }, { status: 404 })
    }

    // Check if the user is the test taker or the test creator
    if (session.user.id !== attempt.taker.id && session.user.id !== attempt.test.creatorId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(attempt)
  } catch (error) {
    console.error('Failed to fetch results:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
