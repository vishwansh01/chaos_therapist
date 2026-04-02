import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/messages?threadId=xxx
export async function GET(req: NextRequest) {
  const threadId = req.nextUrl.searchParams.get('threadId')
  if (!threadId) return NextResponse.json({ error: 'Missing threadId' }, { status: 400 })

  try {
    const now = new Date()
    const messages = await prisma.message.findMany({
      where: {
        threadId,
        OR: [
          { scheduledAt: null },
          { scheduledAt: { lte: now } },
        ],
      },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ messages })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}

// POST /api/messages — send a new message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { threadId, sender, content, type, scheduledAt } = body

    if (!threadId || !sender || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        threadId,
        sender,
        content,
        type: type || 'normal',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    })
    return NextResponse.json({ message })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
