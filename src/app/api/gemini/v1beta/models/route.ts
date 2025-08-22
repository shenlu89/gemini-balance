import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    // Verify API key from header or query
    const apiKey = request.headers.get('x-goog-api-key') || 
                   request.nextUrl.searchParams.get('key')
    
    if (!apiKey || !config.ALLOWED_TOKENS.includes(apiKey)) {
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
      `${config.BASE_URL}/models?key=${geminiKey}&pageSize=1000`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Filter out blocked models
    if (data.models) {
      data.models = data.models.filter((model: any) => {
        const modelId = model.name.split('/').pop()
        return !config.FILTERED_MODELS.includes(modelId)
      })
      
      // Add derived models
      const derivedModels = []
      
      for (const model of data.models) {
        const modelId = model.name.split('/').pop()
        
        // Add search variants
        if (config.SEARCH_MODELS.includes(modelId)) {
          derivedModels.push({
            ...model,
            name: `models/${modelId}-search`,
            displayName: `${model.displayName} For Search`,
          })
        }
        
        // Add image variants
        if (config.IMAGE_MODELS.includes(modelId)) {
          derivedModels.push({
            ...model,
            name: `models/${modelId}-image`,
            displayName: `${model.displayName} For Image`,
          })
        }
      }
      
      data.models.push(...derivedModels)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Models API error:', error)
    return NextResponse.json(
      { error: { message: 'Failed to fetch models' } },
      { status: 500 }
    )
  }
}