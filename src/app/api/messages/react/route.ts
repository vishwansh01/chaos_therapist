import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PATCH /api/messages/react — add reaction to confession
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { messageId, reaction } = body

    if (!messageId || !reaction) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const message = await prisma.message.update({
      where: { id: messageId },
      data: { reaction },
    })
    return NextResponse.json({ message })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to react' }, { status: 500 })
  }
}
