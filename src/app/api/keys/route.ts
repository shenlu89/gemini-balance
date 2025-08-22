import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { settings, requestLogs } from '@/lib/db/schema'
import { eq, desc, and, gte } from 'drizzle-orm'
import { config } from '@/lib/config'

export async function GET() {
  try {
    await requireAuth()
    
    // Get API keys from settings
    const apiKeysSettings = await db.select()
      .from(settings)
      .where(eq(settings.key, 'API_KEYS'))
      .limit(1)
    
    let apiKeys: string[] = config.API_KEYS
    if (apiKeysSettings.length > 0 && apiKeysSettings[0].value) {
      try {
        apiKeys = JSON.parse(apiKeysSettings[0].value)
      } catch {
        // Use default if parsing fails
      }
    }
    
    // Get recent request logs to determine key status
    const recentLogs = await db.select()
      .from(requestLogs)
      .where(gte(requestLogs.requestTime, new Date(Date.now() - 24 * 60 * 60 * 1000)))
      .orderBy(desc(requestLogs.requestTime))
    
    // Calculate key statistics
    const keyStats = apiKeys.map(key => {
      const keyLogs = recentLogs.filter(log => log.apiKey === key)
      const failedLogs = keyLogs.filter(log => !log.isSuccess)
      const lastUsedLog = keyLogs[0]
      
      return {
        key,
        status: failedLogs.length < 5 ? 'valid' : 'invalid' as const,
        failCount: failedLogs.length,
        lastUsed: lastUsedLog?.requestTime,
        model: lastUsedLog?.modelName,
      }
    })
    
    return NextResponse.json({ keys: keyStats })
  } catch (error) {
    console.error('Keys fetch error:', error)
    return NextResponse.json(
      { message: '获取密钥状态失败' },
      { status: 500 }
    )
  }
}