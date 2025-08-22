import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    await requireAuth()
    
    const keyToDelete = decodeURIComponent(params.key)
    
    // Get current API keys
    const apiKeysSettings = await db.select()
      .from(settings)
      .where(eq(settings.key, 'API_KEYS'))
      .limit(1)
    
    let apiKeys: string[] = []
    if (apiKeysSettings.length > 0 && apiKeysSettings[0].value) {
      try {
        apiKeys = JSON.parse(apiKeysSettings[0].value)
      } catch {
        return NextResponse.json(
          { message: '无法解析当前 API 密钥配置' },
          { status: 500 }
        )
      }
    }
    
    // Remove the key
    const updatedKeys = apiKeys.filter(key => key !== keyToDelete)
    
    if (updatedKeys.length === apiKeys.length) {
      return NextResponse.json(
        { message: '密钥不存在' },
        { status: 404 }
      )
    }
    
    // Update in database
    await db.update(settings)
      .set({
        value: JSON.stringify(updatedKeys),
        updatedAt: new Date(),
      })
      .where(eq(settings.key, 'API_KEYS'))
    
    return NextResponse.json({ message: '密钥已删除' })
  } catch (error) {
    console.error('Key deletion error:', error)
    return NextResponse.json(
      { message: '删除密钥失败' },
      { status: 500 }
    )
  }
}