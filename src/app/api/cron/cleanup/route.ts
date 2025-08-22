import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { errorLogs, requestLogs } from '@/lib/db/schema'
import { lt } from 'drizzle-orm'
import { config } from '@/lib/config'

export async function GET() {
  try {
    const now = new Date()
    
    // Clean up old error logs
    if (config.AUTO_DELETE_ERROR_LOGS_ENABLED) {
      const errorLogCutoff = new Date(now.getTime() - config.AUTO_DELETE_ERROR_LOGS_DAYS * 24 * 60 * 60 * 1000)
      await db.delete(errorLogs).where(lt(errorLogs.requestTime, errorLogCutoff))
    }
    
    // Clean up old request logs
    if (config.AUTO_DELETE_REQUEST_LOGS_ENABLED) {
      const requestLogCutoff = new Date(now.getTime() - config.AUTO_DELETE_REQUEST_LOGS_DAYS * 24 * 60 * 60 * 1000)
      await db.delete(requestLogs).where(lt(requestLogs.requestTime, requestLogCutoff))
    }
    
    return NextResponse.json({ message: 'Cleanup completed' })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { message: 'Cleanup failed' },
      { status: 500 }
    )
  }
}