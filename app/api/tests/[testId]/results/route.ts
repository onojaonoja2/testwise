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

    const testId = req.nextUrl.pathname.split('/').slice(-2, -1)[0]
        const attempts = await prisma.attempt.findMany({
      where: {
        testId: testId,
        test: {
          creatorId: session.user.id,
        },
      },
      include: {
        taker: { select: { name: true } },
      },
    })

    return NextResponse.json(attempts)
  } catch (error) {
    console.error('Failed to fetch results:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
