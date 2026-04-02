import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/admin/messages?threadId=xxx&secret=xxx — all messages including future scheduled
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized chaos' }, { status: 401 })
  }

  const threadId = req.nextUrl.searchParams.get('threadId')
  if (!threadId) return NextResponse.json({ error: 'Missing threadId' }, { status: 400 })

  try {
    const messages = await prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ messages })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
