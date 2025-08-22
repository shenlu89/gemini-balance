import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    // Verify API key
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { message: 'Missing or invalid authorization header' } },
        { status: 401 }
      )
    }

    const apiKey = authHeader.slice(7)
    if (!config.ALLOWED_TOKENS.includes(apiKey)) {
      return NextResponse.json(
        { error: { message: 'Invalid API key' } },
        { status: 401 }
      )
    }

    // Get a valid Gemini API key
    const geminiKey = config.API_KEYS[0]
    if (!geminiKey) {
      return NextResponse.json(
        { error: { message: 'No Gemini API keys configured' } },
        { status: 503 }
      )
    }

    // Fetch models from Gemini API
    const response = await fetch(
      `${config.BASE_URL}/models?key=${geminiKey}&pageSize=1000`
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Convert to OpenAI format
    const openaiModels = {
      object: 'list',
      data: [],
    }

    if (data.models) {
      for (const model of data.models) {
        const modelId = model.name.split('/').pop()
        
        // Skip filtered models
        if (config.FILTERED_MODELS.includes(modelId)) continue
        
        openaiModels.data.push({
          id: modelId,
          object: 'model',
          created: Math.floor(Date.now() / 1000),
          owned_by: 'google',
          permission: [],
          root: model.name,
          parent: null,
        })
        
        // Add derived models
        if (config.SEARCH_MODELS.includes(modelId)) {
          openaiModels.data.push({
            id: `${modelId}-search`,
            object: 'model',
            created: Math.floor(Date.now() / 1000),
            owned_by: 'google',
            permission: [],
            root: model.name,
            parent: null,
          })
        }
        
        if (config.IMAGE_MODELS.includes(modelId)) {
          openaiModels.data.push({
            id: `${modelId}-image`,
            object: 'model',
            created: Math.floor(Date.now() / 1000),
            owned_by: 'google',
            permission: [],
            root: model.name,
            parent: null,
          })
        }
      }
    }

    return NextResponse.json(openaiModels)
  } catch (error) {
    console.error('Models API error:', error)
    return NextResponse.json(
      { error: { message: 'Failed to fetch models' } },
      { status: 500 }
    )
  }
}