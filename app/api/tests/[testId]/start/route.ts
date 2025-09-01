import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request, { params }: { params: { testId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const test = await prisma.test.findUnique({
      where: { id: params.testId },
      include: { questions: true },
    })

    if (!test) {
      return NextResponse.json({ message: 'Test not found' }, { status: 404 })
    }

    const now = new Date()
    if (now < test.startDate || now > test.endDate) {
      return NextResponse.json({ message: 'Test is not available at this time' }, { status: 403 })
    }

    const attempt = await prisma.attempt.create({
      data: {
        testId: test.id,
        takerId: session.user.id,
      },
    })

    // Don't send answers in the response
    const questions = test.questions.map(({ answer, ...q }) => q)

    return NextResponse.json({ test: { ...test, questions }, attempt })
  } catch (error) {
    console.error('Failed to start test:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
