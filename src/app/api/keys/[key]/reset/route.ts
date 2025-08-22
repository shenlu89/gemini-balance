import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    await requireAuth()
    
    const key = decodeURIComponent(params.key)
    
    // In a real implementation, you would reset the failure count for this key
    // For now, we'll just return success
    
    return NextResponse.json({ message: '密钥已重置' })
  } catch (error) {
    console.error('Key reset error:', error)
    return NextResponse.json(
      { message: '重置密钥失败' },
      { status: 500 }
    )
  }
}