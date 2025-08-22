import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { db } from '@/lib/db'
import { requestLogs, errorLogs } from '@/lib/db/schema'

export async function POST(
  request: NextRequest,
  { params }: { params: { model: string } }
) {
  const startTime = Date.now()
  let apiKey: string | null = null
  let success = false
  let statusCode = 200

  try {
    // Verify API key
    apiKey = request.headers.get('x-goog-api-key') || 
             request.nextUrl.searchParams.get('key')
    
    if (!apiKey || !config.ALLOWED_TOKENS.includes(apiKey)) {
      statusCode = 401
      return NextResponse.json(
        { error: { message: 'Invalid API key' } },
        { status: 401 }
      )
    }

    const model = params.model
    const body = await request.json()

    // Get a valid Gemini API key
    const geminiKey = config.API_KEYS[0]
    if (!geminiKey) {
      statusCode = 503
      return NextResponse.json(
        { error: { message: 'No Gemini API keys configured' } },
        { status: 503 }
      )
    }

    // Clean model name (remove suffixes)
    let cleanModel = model
    if (model.endsWith('-search')) {
      cleanModel = model.slice(0, -7)
      // Add search tool
      if (!body.tools) body.tools = []
      body.tools.push({ googleSearch: {} })
    }
    if (model.endsWith('-image')) {
      cleanModel = model.slice(0, -6)
      // Add image generation config
      if (!body.generationConfig) body.generationConfig = {}
      body.generationConfig.responseModalities = ['Text', 'Image']
    }

    // Forward to Gemini API
    const response = await fetch(
      `${config.BASE_URL}/models/${cleanModel}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    const responseData = await response.json()
    
    if (!response.ok) {
      statusCode = response.status
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(responseData)}`)
    }

    success = true
    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Generate content error:', error)
    
    // Log error to database
    if (apiKey) {
      try {
        await db.insert(errorLogs).values({
          geminiKey: config.API_KEYS[0],
          modelName: params.model,
          errorType: 'gemini-generate-content',
          errorLog: error instanceof Error ? error.message : String(error),
          errorCode: statusCode,
          requestMsg: await request.json().catch(() => null),
        })
      } catch (logError) {
        console.error('Failed to log error:', logError)
      }
    }

    return NextResponse.json(
      { error: { message: 'Content generation failed' } },
      { status: statusCode }
    )
  } finally {
    // Log request
    if (apiKey) {
      try {
        const latency = Date.now() - startTime
        await db.insert(requestLogs).values({
          modelName: params.model,
          apiKey: config.API_KEYS[0],
          isSuccess: success,
          statusCode,
          latencyMs: latency,
        })
      } catch (logError) {
        console.error('Failed to log request:', logError)
      }
    }
  }
}