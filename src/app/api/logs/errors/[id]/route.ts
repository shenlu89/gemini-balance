import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { errorLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    
    const id = parseInt(params.id)
    
    await db.delete(errorLogs)
      .where(eq(errorLogs.id, id))
    
    return NextResponse.json({ message: '日志已删除' })
  } catch (error) {
    console.error('Error log deletion error:', error)
    return NextResponse.json(
      { message: '删除日志失败' },
      { status: 500 }
    )
  }
}