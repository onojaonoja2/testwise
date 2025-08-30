import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: { testId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const test = await prisma.test.findUnique({
      where: {
        id: params.testId,
        creatorId: session.user.id
      },
      include: {
        questions: true
      }
    })

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error('Fetch test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request, { params }: { params: { testId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, description, duration, type, startDate, endDate } = await req.json()

    const test = await prisma.test.update({
      where: {
        id: params.testId,
        creatorId: session.user.id
      },
      data: {
        title,
        description,
        duration,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    })

    return NextResponse.json(test)
  } catch (error) {
    console.error('Update test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { testId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.test.delete({
      where: {
        id: params.testId,
        creatorId: session.user.id
      }
    })

    return NextResponse.json(
      { message: 'Test deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}