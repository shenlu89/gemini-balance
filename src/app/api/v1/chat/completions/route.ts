import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { db } from '@/lib/db'
import { requestLogs, errorLogs } from '@/lib/db/schema'

interface GeminiRequest {
  contents: any[]
  generationConfig: {
    temperature?: number
    maxOutputTokens?: number
    topP?: number
    topK?: number
  }
  systemInstruction?: {
    role: string
    parts: { text: string }[]
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let apiKey: string | null = null
  let body: any = null
  let success = false
  let statusCode = 200

  try {
    // Verify API key
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      statusCode = 401
      return NextResponse.json(
        { error: { message: 'Missing or invalid authorization header' } },
        { status: 401 }
      )
    }

    apiKey = authHeader.slice(7)
    if (!config.ALLOWED_TOKENS.includes(apiKey)) {
      statusCode = 401
      return NextResponse.json(
        { error: { message: 'Invalid API key' } },
        { status: 401 }
      )
    }

    body = await request.json()
    const { messages, model, stream = false, ...otherParams } = body

    // Get a valid Gemini API key
    const geminiKey = config.API_KEYS[0]
    if (!geminiKey) {
      statusCode = 503
      return NextResponse.json(
        { error: { message: 'No Gemini API keys configured' } },
        { status: 503 }
      )
    }

    // Convert OpenAI format to Gemini format
    const geminiMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }],
    }))

    // Build Gemini request
    const geminiRequest: GeminiRequest = {
      contents: geminiMessages.filter((msg: any) => msg.role !== 'system'),
      generationConfig: {
        temperature: otherParams.temperature,
        maxOutputTokens: otherParams.max_tokens,
        topP: otherParams.top_p,
        topK: otherParams.top_k,
      },
    }

    // Add system instruction if present
    const systemMessage = messages.find((msg: any) => msg.role === 'system')
    if (systemMessage) {
      geminiRequest.systemInstruction = {
        role: 'system',
        parts: [{ text: systemMessage.content }],
      }
    }

    // Handle streaming
    if (stream) {
      const response = await fetch(
        `${config.BASE_URL}/models/${model}:streamGenerateContent?alt=sse&key=${geminiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(geminiRequest),
        }
      )

      if (!response.ok) {
        statusCode = response.status
        throw new Error(`Gemini API error: ${response.status}`)
      }

      success = true
      
      // Convert Gemini streaming response to OpenAI format
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader()
          if (!reader) return

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = new TextDecoder().decode(value)
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    
                    // Convert to OpenAI format
                    const openaiChunk = {
                      id: `chatcmpl-${Date.now()}`,
                      object: 'chat.completion.chunk',
                      created: Math.floor(Date.now() / 1000),
                      model,
                      choices: [{
                        index: 0,
                        delta: {
                          content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
                        },
                        finish_reason: null,
                      }],
                    }
                    
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(openaiChunk)}\n\n`))
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }
            
            // Send final chunk
            const finalChunk = {
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model,
              choices: [{
                index: 0,
                delta: {},
                finish_reason: 'stop',
              }],
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`))
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Non-streaming request
    const response = await fetch(
      `${config.BASE_URL}/models/${model}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiRequest),
      }
    )

    const responseData = await response.json()
    
    if (!response.ok) {
      statusCode = response.status
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(responseData)}`)
    }

    success = true

    // Convert Gemini response to OpenAI format
    const openaiResponse = {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: responseData.candidates?.[0]?.content?.parts?.[0]?.text || '',
        },
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: responseData.usageMetadata?.promptTokenCount || 0,
        completion_tokens: responseData.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: responseData.usageMetadata?.totalTokenCount || 0,
      },
    }

    return NextResponse.json(openaiResponse)

  } catch (error) {
    console.error('Chat completion error:', error)
    
    // Log error to database
    if (apiKey) {
      try {
        await db.insert(errorLogs).values({
          geminiKey: config.API_KEYS[0],
          modelName: body?.model || 'unknown',
          errorType: 'openai-chat-completion',
          errorLog: error instanceof Error ? error.message : String(error),
          errorCode: statusCode,
          requestMsg: body,
        })
      } catch (logError) {
        console.error('Failed to log error:', logError)
      }
    }

    return NextResponse.json(
      { error: { message: 'Chat completion failed' } },
      { status: statusCode }
    )
  } finally {
    // Log request
    if (apiKey) {
      try {
        const latency = Date.now() - startTime
        await db.insert(requestLogs).values({
          modelName: body?.model || 'unknown',
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