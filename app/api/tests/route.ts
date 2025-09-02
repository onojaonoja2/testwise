import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, duration, type, startDate, endDate, questions } = await req.json()

    if (!title || !duration || !type || !startDate || !endDate || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const test = await prisma.test.create({
      data: {
        title,
        description,
        duration,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        creatorId: session.user.id,
        questions: {
          create: questions.map(q => ({
            text: q.text,
            points: q.points,
            type: q.type,
            options: {
              create: q.options.map(o => ({
                text: o.text,
                isCorrect: o.isCorrect,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    })

    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    console.error('Test creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tests = await prisma.test.findMany({
      where: {
        creatorId: session.user.id
      },
      include: {
        _count: {
          select: { attempts: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tests)
  } catch (error) {
    console.error('Fetch tests error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}