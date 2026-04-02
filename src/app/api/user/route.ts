import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateNickname } from '@/lib/nicknames'

// POST /api/user — create a new anonymous user
export async function POST(req: NextRequest) {
  try {
    const nickname = generateNickname()
    const user = await prisma.user.create({
      data: { nickname },
    })
    // Also create their first thread
    const thread = await prisma.thread.create({
      data: { userId: user.id },
    })
    return NextResponse.json({ user, threadId: thread.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

// GET /api/user?id=xxx — fetch existing user
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { threads: { take: 1, orderBy: { createdAt: 'asc' } } },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ user, threadId: user.threads[0]?.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
