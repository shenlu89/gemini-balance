import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { errorLogs } from '@/lib/db/schema'
import { desc, and, like, gte, lte } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const keySearch = searchParams.get('keySearch')
    const errorSearch = searchParams.get('errorSearch')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    let query = db.select().from(errorLogs)
    const conditions = []
    
    if (keySearch) {
      conditions.push(like(errorLogs.geminiKey, `%${keySearch}%`))
    }
    
    if (errorSearch) {
      conditions.push(like(errorLogs.errorType, `%${errorSearch}%`))
    }
    
    if (startDate) {
      conditions.push(gte(errorLogs.requestTime, new Date(startDate)))
    }
    
    if (endDate) {
      conditions.push(lte(errorLogs.requestTime, new Date(endDate)))
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }
    
    const logs = await query
      .orderBy(desc(errorLogs.requestTime))
      .limit(limit)
      .offset(offset)
    
    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error logs fetch error:', error)
    return NextResponse.json(
      { message: '获取错误日志失败' },
      { status: 500 }
    )
  }
}