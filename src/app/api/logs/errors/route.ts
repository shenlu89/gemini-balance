import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { errorLogs } from '@/lib/db/schema'
import { desc, and, like, gte, lte, eq, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const keySearch = searchParams.get('keySearch')
    const errorSearch = searchParams.get('errorSearch')
    const errorCodeSearch = searchParams.get('errorCodeSearch')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const filters = []
    
    if (keySearch) {
      filters.push(like(errorLogs.geminiKey, `%${keySearch}%`))
    }
    
    if (errorSearch) {
      filters.push(like(errorLogs.errorType, `%${errorSearch}%`))
    }
    
    if (errorCodeSearch) {
      const code = parseInt(errorCodeSearch)
      if (!isNaN(code)) {
        filters.push(eq(errorLogs.errorCode, code))
      }
    }
    
    if (startDate) {
      filters.push(gte(errorLogs.requestTime, new Date(startDate)))
    }
    
    if (endDate) {
      filters.push(lte(errorLogs.requestTime, new Date(endDate)))
    }
    
    const finalWhereClause = filters.length > 0 ? and(...filters) : undefined
    
    const logs = await db.select().from(errorLogs)
      .where(finalWhereClause)
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