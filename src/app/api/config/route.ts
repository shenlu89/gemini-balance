import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { config } from '@/lib/config'

export async function GET() {
  try {
    await requireAuth()
    
    // Get all settings from database
    const dbSettings = await db.select().from(settings)
    
    // Merge with default config
    const currentConfig = { ...config }
    
    for (const setting of dbSettings) {
      if (setting.value) {
        try {
          currentConfig[setting.key as keyof typeof config] = JSON.parse(setting.value)
        } catch {
          currentConfig[setting.key as keyof typeof config] = setting.value as any
        }
      }
    }
    
    return NextResponse.json(currentConfig)
  } catch (error) {
    return NextResponse.json(
      { message: '获取配置失败' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth()
    
    const body = await request.json()
    
    // Update settings in database
    for (const [key, value] of Object.entries(body)) {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
      
      await db.insert(settings)
        .values({
          key,
          value: stringValue,
          description: `${key} configuration setting`,
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: {
            value: stringValue,
            updatedAt: new Date(),
          },
        })
    }
    
    return NextResponse.json({ message: '配置已保存' })
  } catch (error) {
    console.error('Config update error:', error)
    return NextResponse.json(
      { message: '保存配置失败' },
      { status: 500 }
    )
  }
}